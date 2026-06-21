export declare class CreateAdviceDto {
    mediaId?: string;
}
export declare class AdviceService {
    createAdvice(bonsaiId: string, createAdviceDto: CreateAdviceDto): {
        mediaId?: string;
        bonsaiId: string;
    };
    getAdvices(bonsaiId: string): never[];
}
