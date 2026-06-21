import { CreateBonsaiDto } from './create-bonsai.dto';
export declare class UpdateBonsaiDto implements Partial<CreateBonsaiDto> {
    name?: string;
    nickname?: string;
    species?: string;
    acquiredAt?: string;
    estimatedAge?: number;
    origin?: string;
    potInfo?: string;
    style?: string;
    currentState?: string;
}
