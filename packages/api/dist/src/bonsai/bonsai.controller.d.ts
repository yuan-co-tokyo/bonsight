import { BonsaiService } from './bonsai.service';
import { CreateBonsaiDto } from './dto/create-bonsai.dto';
import { UpdateBonsaiDto } from './dto/update-bonsai.dto';
export declare class BonsaiController {
    private readonly bonsaiService;
    constructor(bonsaiService: BonsaiService);
    getBonsais(): never[];
    getBonsai(id: string): {
        id: string;
    };
    createBonsai(createBonsaiDto: CreateBonsaiDto): CreateBonsaiDto;
    updateBonsai(id: string, updateBonsaiDto: UpdateBonsaiDto): {
        name?: string;
        nickname?: string;
        species?: string;
        acquiredAt?: string;
        estimatedAge?: number;
        origin?: string;
        potInfo?: string;
        style?: string;
        currentState?: string;
        id: string;
    };
    deleteBonsai(id: string): {
        id: string;
        deleted: boolean;
    };
}
