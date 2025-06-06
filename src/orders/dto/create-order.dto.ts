import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsPositive } from "class-validator";
import { OrderStatus } from "generated/prisma";
import { OrderStatusList } from "../enum/order.enum";
import { Type } from "class-transformer";

export class CreateOrderDto {
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    totalAmount: number;

    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    totalItems: number;

    @IsEnum(OrderStatusList, {
        message: `Status must be one of the following: ${OrderStatusList.join(', ')}`,
    })
    @IsOptional()
    status?: OrderStatus = OrderStatus.PENDING;

    @IsBoolean()
    @IsOptional()
    paid?: boolean = false;
}
