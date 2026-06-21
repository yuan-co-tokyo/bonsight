import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models.js';
export type * from './prismaNamespace.js';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
export declare const DbNull: import("@prisma/client/runtime/client").DbNullClass;
export declare const JsonNull: import("@prisma/client/runtime/client").JsonNullClass;
export declare const AnyNull: import("@prisma/client/runtime/client").AnyNullClass;
export declare const ModelName: {
    readonly User: "User";
    readonly Bonsai: "Bonsai";
    readonly Media: "Media";
    readonly AIAdvice: "AIAdvice";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly cognitoSub: "cognitoSub";
    readonly displayName: "displayName";
    readonly region: "region";
    readonly climatezone: "climatezone";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const BonsaiScalarFieldEnum: {
    readonly id: "id";
    readonly owner: "owner";
    readonly visibility: "visibility";
    readonly name: "name";
    readonly nickname: "nickname";
    readonly species: "species";
    readonly acquiredAt: "acquiredAt";
    readonly estimatedAge: "estimatedAge";
    readonly origin: "origin";
    readonly potInfo: "potInfo";
    readonly style: "style";
    readonly currentState: "currentState";
    readonly coverImageKey: "coverImageKey";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly userId: "userId";
};
export type BonsaiScalarFieldEnum = (typeof BonsaiScalarFieldEnum)[keyof typeof BonsaiScalarFieldEnum];
export declare const MediaScalarFieldEnum: {
    readonly id: "id";
    readonly bonsaiId: "bonsaiId";
    readonly type: "type";
    readonly s3Key: "s3Key";
    readonly caption: "caption";
    readonly takenAt: "takenAt";
    readonly createdAt: "createdAt";
};
export type MediaScalarFieldEnum = (typeof MediaScalarFieldEnum)[keyof typeof MediaScalarFieldEnum];
export declare const AIAdviceScalarFieldEnum: {
    readonly id: "id";
    readonly bonsaiId: "bonsaiId";
    readonly mediaId: "mediaId";
    readonly diagnosis: "diagnosis";
    readonly confidence: "confidence";
    readonly createdAt: "createdAt";
};
export type AIAdviceScalarFieldEnum = (typeof AIAdviceScalarFieldEnum)[keyof typeof AIAdviceScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const JsonNullValueInput: {
    readonly JsonNull: import("@prisma/client/runtime/client").JsonNullClass;
};
export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
export declare const JsonNullValueFilter: {
    readonly DbNull: import("@prisma/client/runtime/client").DbNullClass;
    readonly JsonNull: import("@prisma/client/runtime/client").JsonNullClass;
    readonly AnyNull: import("@prisma/client/runtime/client").AnyNullClass;
};
export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];
