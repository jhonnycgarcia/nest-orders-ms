import { ArrayMinSize, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { OrderItemDto } from "./order-item.dto";

export class CreateOrderDto {
    // @IsNumber()
    // @IsPositive()
    // @Type(() => Number)
    // totalAmount: number;

    // @IsNumber()
    // @IsPositive()
    // @Type(() => Number)
    // totalItems: number;

    // @IsEnum(OrderStatusList, {
    //     message: `Status must be one of the following: ${OrderStatusList.join(', ')}`,
    // })
    // @IsOptional()
    // status?: OrderStatus = OrderStatus.PENDING;

    // @IsBoolean()
    // @IsOptional()
    // paid?: boolean = false;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}
