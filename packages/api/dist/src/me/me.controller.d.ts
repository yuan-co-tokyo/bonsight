import { MeService, UpdateUserDto } from './me.service';
export declare class MeController {
    private readonly meService;
    constructor(meService: MeService);
    getMe(): null;
    updateMe(updateUserDto: UpdateUserDto): UpdateUserDto;
}
