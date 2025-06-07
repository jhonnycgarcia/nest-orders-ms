import { HttpStatus, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient } from 'generated/prisma';
import { RpcException } from '@nestjs/microservices';
import { ChangeOrderStatusDto, OrderPaginationDto } from './dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger(OrdersService.name);

  onModuleInit() {
    this.$connect();
    this.logger.log('Connected to database');
  }

  create(createOrderDto: CreateOrderDto) {
    return {
      service: 'Orders Microservice',
      createOrderDto
    }
    // return this.order.create({
    //   data: createOrderDto,
    // });
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
    });

    if (!order) {
      // throw new NotFoundException(`Order not found with id ${id}`);
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order not found with id ${id}`,
      });
    }

    return order;
  }

  async changeStatus(changeOrderStatusDto: ChangeOrderStatusDto) {
    const { id, status } = changeOrderStatusDto;
    const order = await this.findOne(id);

    if(order.status === status) {
      return order;
    }

    return this.order.update({
      where: { id },
      data: { status },
    });
  }
}
