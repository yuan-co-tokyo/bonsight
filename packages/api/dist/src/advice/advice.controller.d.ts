import { AdviceService, CreateAdviceDto } from './advice.service';
export declare class AdviceController {
    private readonly adviceService;
    constructor(adviceService: AdviceService);
    createAdvice(bonsaiId: string, createAdviceDto: CreateAdviceDto): {
        mediaId?: string;
        bonsaiId: string;
    };
    getAdvices(bonsaiId: string): never[];
}
