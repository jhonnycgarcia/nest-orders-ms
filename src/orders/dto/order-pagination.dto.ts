import { IsOptional, IsEnum } from "class-validator";
import { OrderStatus } from "generated/prisma";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { OrderStatusList } from "../enum/order.enum";

export class OrderPaginationDto extends PaginationDto {
    @IsOptional()
    @IsEnum(OrderStatusList, {
        message: `Status must be one of the following: ${OrderStatusList.join(', ')}`,
    })
    status?: OrderStatus;
}