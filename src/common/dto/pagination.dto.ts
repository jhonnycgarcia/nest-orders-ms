import { Type } from "class-transformer";
import { IsOptional, IsNumber, Min } from "class-validator";

export class PaginationDto {
    @IsNumber()
    @IsOptional()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    limit?: number = 10;
}