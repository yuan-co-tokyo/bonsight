export declare const BonsaiVisibility: {
    readonly PRIVATE: "PRIVATE";
    readonly UNLISTED: "UNLISTED";
    readonly PUBLIC: "PUBLIC";
};
export type BonsaiVisibility = (typeof BonsaiVisibility)[keyof typeof BonsaiVisibility];
export declare const MediaType: {
    readonly PHOTO: "PHOTO";
    readonly VIDEO: "VIDEO";
};
export type MediaType = (typeof MediaType)[keyof typeof MediaType];
