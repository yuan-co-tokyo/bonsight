export declare class UpdateUserDto {
    displayName?: string;
    region?: string;
    climatezone?: string;
}
export declare class MeService {
    getMe(): null;
    updateMe(updateUserDto: UpdateUserDto): UpdateUserDto;
}
