import { ChatRequestDto, ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    chat(bonsaiId: string, chatRequestDto: ChatRequestDto): {
        bonsaiId: string;
        message: string;
    };
}
