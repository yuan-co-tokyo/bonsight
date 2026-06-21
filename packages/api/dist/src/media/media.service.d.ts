export declare class CreateMediaDto {
    s3Key: string;
    caption?: string;
    takenAt?: string;
    type?: 'PHOTO' | 'VIDEO';
}
export declare class MediaService {
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
