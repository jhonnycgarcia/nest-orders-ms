import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient } from 'generated/prisma';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { ChangeOrderStatusDto, OrderPaginationDto, PaidOrderDto } from './dto';
import { NATS_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';
import { OrderWithProducts } from './interfaces/order-with-products.interface';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {
    super();
  }

  onModuleInit() {
    this.$connect();
    this.logger.log('Connected to database');
  }

  async create(createOrderDto: CreateOrderDto) {
    try {
      const { items } = createOrderDto;
      const ids = items.map((item) => item.productId);

      // 1. Confirmar los Ids de los productos
      const products = await firstValueFrom(
        this.client.send({ cmd: 'validate_products' }, { ids })
      );

      // 2. Calcular el total de los valores
      const totalAmount = items.reduce((acc, orderItem) => {
        const { productId, quantity } = orderItem;
        const price = products.find((product: any) => product.id === productId).price;
        return acc + (price * quantity);
      }, 0);

      const totalItems = items.reduce((acc, orderItem) => {
        const { quantity } = orderItem;
        return acc + quantity;
      }, 0);

      // 3. Crear una transaccion en la base de datos
      const order = await this.order.create({
        data: {
          totalAmount,
          totalItems,
          status: 'PENDING', // Add required status field
          orderItems: {
            createMany: {
              data: items.map((item) => ({
                product: item.productId,
                quantity: item.quantity,
                price: products.find((product: any) => product.id === item.productId).price,
              })),
            },
          },
        },
        include: {
          orderItems: {
            select: {
              price: true,
              quantity: true,
              product: true,
            }
          }
        },
      });

      return {
        ...order,
        orderItems: order.orderItems.map((item) => ({
          ...item,
          name: products.find((product: any) => product.id === item.product).name,
        })),
      };

    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Check logs for more information',
      });
    }
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const { page, limit, status } = orderPaginationDto;


    const total = await this.order.count({
      where: {
        status,
      },
    });

    const lastPage = Math.ceil(total / limit!);
    const skip = (page! - 1) * limit!;
    const orders = await this.order.findMany({
      skip,
      take: limit,
      where: {
        status,
      },
    });

    return {
      data: orders,
      meta: {
        total,
        page: page!,
        lastPage,
        limit: limit!,
      },
    };
  }

  async findOne(id: string) {
    const order = await this.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          select: {
            price: true,
            quantity: true,
            product: true,
          }
        }
      }
    });

    if (!order) {
      // throw new NotFoundException(`Order not found with id ${id}`);
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order not found with id ${id}`,
      });
    }

    const productIds = order.orderItems.map((item) => item.product);

    const products = await firstValueFrom(
      this.client.send({ cmd: 'validate_products' }, { ids: productIds })
    );

    order.orderItems = order.orderItems.map((item) => ({
      ...item,
      name: products.find((product: any) => product.id === item.product).name,
    }));

    return order;
  }

  async changeStatus(changeOrderStatusDto: ChangeOrderStatusDto) {
    const { id, status } = changeOrderStatusDto;
    const order = await this.findOne(id);

    if (order.status === status) {
      return order;
    }

    return this.order.update({
      where: { id },
      data: { status },
    });
  }

  async createPaymentSession(order: OrderWithProducts) {
    const paymentSession = await firstValueFrom(
      this.client.send('create.payment.session', {
        orderId: order.id,
        currency: 'usd',
        items: order.orderItems.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      })
    );
    return paymentSession;
  }

  async paidOrder(paidOrderDto: PaidOrderDto) {
    this.logger.log('paid order');
    this.logger.log({ paidOrderDto });

    const updatedOrder = await this.order.update({
      where: { id: paidOrderDto.orderId },
      data: {
        status: 'PAID',
        paid: true,
        paidAt: new Date(),
        stripePaymentId: paidOrderDto.stripePaymentId,

        // Relacion con el recibo de pago
        OrderReceipt: {
          create: {
            receiptUrl: paidOrderDto.receipt_url,
          },
        },
      },
    });

    return updatedOrder;
  }
}
