import { OrderStatus } from "generated/prisma";

export interface OrderWithProducts {
    orderItems: {
        name: any;
        quantity: number;
        product: number;
        price: number;
    }[];
    id: string;
    totalAmount: number;
    totalItems: number;
    status: OrderStatus;
    paid: boolean;
    paidAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}