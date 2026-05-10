import { IsString } from "class-validator";

export class SendMessageDto {
    @IsString()
    roomId: string

    @IsString()
    content: string
}