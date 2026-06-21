import { CreateMediaDto, MediaService } from './media.service';
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    getMedia(bonsaiId: string): never[];
    presign(): {
        uploadUrl: string;
        key: string;
    };
    createMedia(bonsaiId: string, createMediaDto: CreateMediaDto): {
        s3Key: string;
        caption?: string;
        takenAt?: string;
        type?: "PHOTO" | "VIDEO";
        bonsaiId: string;
    };
}
