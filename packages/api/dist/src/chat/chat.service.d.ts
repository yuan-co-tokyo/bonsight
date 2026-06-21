export declare class ChatRequestDto {
    message: string;
}
export declare class ChatService {
    chat(bonsaiId: string, chatRequestDto: ChatRequestDto): {
        bonsaiId: string;
        message: string;
    };
}
