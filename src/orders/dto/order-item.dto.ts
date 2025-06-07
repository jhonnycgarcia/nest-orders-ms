import { Type } from "class-transformer";
import { IsInt, IsNumber, IsPositive } from "class-validator";

export class OrderItemDto {
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    productId: number;

    @IsInt()
    @IsPositive()
    @Type(() => Number)
    quantity: number;

    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    price: number;
}