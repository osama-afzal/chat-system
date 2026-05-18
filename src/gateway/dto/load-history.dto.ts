import { IsIn, IsInt, IsOptional, isString, IsString } from "class-validator";

export class LoadHistoryDto {
    @IsString()
    roomId: string

    @IsOptional()
    beforeSequenceNumber?: string

    @IsOptional()
    @IsInt()
    limit?: number
}