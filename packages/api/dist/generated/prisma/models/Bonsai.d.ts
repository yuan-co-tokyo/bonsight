import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type BonsaiModel = runtime.Types.Result.DefaultSelection<Prisma.$BonsaiPayload>;
export type AggregateBonsai = {
    _count: BonsaiCountAggregateOutputType | null;
    _avg: BonsaiAvgAggregateOutputType | null;
    _sum: BonsaiSumAggregateOutputType | null;
    _min: BonsaiMinAggregateOutputType | null;
    _max: BonsaiMaxAggregateOutputType | null;
};
export type BonsaiAvgAggregateOutputType = {
    estimatedAge: number | null;
};
export type BonsaiSumAggregateOutputType = {
    estimatedAge: number | null;
};
export type BonsaiMinAggregateOutputType = {
    id: string | null;
    owner: string | null;
    visibility: $Enums.BonsaiVisibility | null;
    name: string | null;
    nickname: string | null;
    species: string | null;
    acquiredAt: Date | null;
    estimatedAge: number | null;
    origin: string | null;
    potInfo: string | null;
    style: string | null;
    currentState: string | null;
    coverImageKey: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    userId: string | null;
};
export type BonsaiMaxAggregateOutputType = {
    id: string | null;
    owner: string | null;
    visibility: $Enums.BonsaiVisibility | null;
    name: string | null;
    nickname: string | null;
    species: string | null;
    acquiredAt: Date | null;
    estimatedAge: number | null;
    origin: string | null;
    potInfo: string | null;
    style: string | null;
    currentState: string | null;
    coverImageKey: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    userId: string | null;
};
export type BonsaiCountAggregateOutputType = {
    id: number;
    owner: number;
    visibility: number;
    name: number;
    nickname: number;
    species: number;
    acquiredAt: number;
    estimatedAge: number;
    origin: number;
    potInfo: number;
    style: number;
    currentState: number;
    coverImageKey: number;
    createdAt: number;
    updatedAt: number;
    userId: number;
    _all: number;
};
export type BonsaiAvgAggregateInputType = {
    estimatedAge?: true;
};
export type BonsaiSumAggregateInputType = {
    estimatedAge?: true;
};
export type BonsaiMinAggregateInputType = {
    id?: true;
    owner?: true;
    visibility?: true;
    name?: true;
    nickname?: true;
    species?: true;
    acquiredAt?: true;
    estimatedAge?: true;
    origin?: true;
    potInfo?: true;
    style?: true;
    currentState?: true;
    coverImageKey?: true;
    createdAt?: true;
    updatedAt?: true;
    userId?: true;
};
export type BonsaiMaxAggregateInputType = {
    id?: true;
    owner?: true;
    visibility?: true;
    name?: true;
    nickname?: true;
    species?: true;
    acquiredAt?: true;
    estimatedAge?: true;
    origin?: true;
    potInfo?: true;
    style?: true;
    currentState?: true;
    coverImageKey?: true;
    createdAt?: true;
    updatedAt?: true;
    userId?: true;
};
export type BonsaiCountAggregateInputType = {
    id?: true;
    owner?: true;
    visibility?: true;
    name?: true;
    nickname?: true;
    species?: true;
    acquiredAt?: true;
    estimatedAge?: true;
    origin?: true;
    potInfo?: true;
    style?: true;
    currentState?: true;
    coverImageKey?: true;
    createdAt?: true;
    updatedAt?: true;
    userId?: true;
    _all?: true;
};
export type BonsaiAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.BonsaiWhereInput;
    orderBy?: Prisma.BonsaiOrderByWithRelationInput | Prisma.BonsaiOrderByWithRelationInput[];
    cursor?: Prisma.BonsaiWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | BonsaiCountAggregateInputType;
    _avg?: BonsaiAvgAggregateInputType;
    _sum?: BonsaiSumAggregateInputType;
    _min?: BonsaiMinAggregateInputType;
    _max?: BonsaiMaxAggregateInputType;
};
export type GetBonsaiAggregateType<T extends BonsaiAggregateArgs> = {
    [P in keyof T & keyof AggregateBonsai]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateBonsai[P]> : Prisma.GetScalarType<T[P], AggregateBonsai[P]>;
};
export type BonsaiGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.BonsaiWhereInput;
    orderBy?: Prisma.BonsaiOrderByWithAggregationInput | Prisma.BonsaiOrderByWithAggregationInput[];
    by: Prisma.BonsaiScalarFieldEnum[] | Prisma.BonsaiScalarFieldEnum;
    having?: Prisma.BonsaiScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: BonsaiCountAggregateInputType | true;
    _avg?: BonsaiAvgAggregateInputType;
    _sum?: BonsaiSumAggregateInputType;
    _min?: BonsaiMinAggregateInputType;
    _max?: BonsaiMaxAggregateInputType;
};
export type BonsaiGroupByOutputType = {
    id: string;
    owner: string;
    visibility: $Enums.BonsaiVisibility;
    name: string;
    nickname: string | null;
    species: string | null;
    acquiredAt: Date | null;
    estimatedAge: number | null;
    origin: string | null;
    potInfo: string | null;
    style: string | null;
    currentState: string | null;
    coverImageKey: string | null;
    createdAt: Date;
    updatedAt: Date;
    userId: string | null;
    _count: BonsaiCountAggregateOutputType | null;
    _avg: BonsaiAvgAggregateOutputType | null;
    _sum: BonsaiSumAggregateOutputType | null;
    _min: BonsaiMinAggregateOutputType | null;
    _max: BonsaiMaxAggregateOutputType | null;
};
export type GetBonsaiGroupByPayload<T extends BonsaiGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<BonsaiGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof BonsaiGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], BonsaiGroupByOutputType[P]> : Prisma.GetScalarType<T[P], BonsaiGroupByOutputType[P]>;
}>>;
export type BonsaiWhereInput = {
    AND?: Prisma.BonsaiWhereInput | Prisma.BonsaiWhereInput[];
    OR?: Prisma.BonsaiWhereInput[];
    NOT?: Prisma.BonsaiWhereInput | Prisma.BonsaiWhereInput[];
    id?: Prisma.StringFilter<"Bonsai"> | string;
    owner?: Prisma.StringFilter<"Bonsai"> | string;
    visibility?: Prisma.EnumBonsaiVisibilityFilter<"Bonsai"> | $Enums.BonsaiVisibility;
    name?: Prisma.StringFilter<"Bonsai"> | string;
    nickname?: Prisma.StringNullableFilter<"Bonsai"> | string | null;
    species?: Prisma.StringNullableFilter<"Bonsai"> | string | null;
    acquiredAt?: Prisma.DateTimeNullableFilter<"Bonsai"> | Date | string | null;
    estimatedAge?: Prisma.IntNullableFilter<"Bonsai"> | number | null;
    origin?: Prisma.StringNullableFilter<"Bonsai"> | string | null;
    potInfo?: Prisma.StringNullableFilter<"Bonsai"> | string | null;
    style?: Prisma.StringNullableFilter<"Bonsai"> | string | null;
    currentState?: Prisma.StringNullableFilter<"Bonsai"> | string | null;
    coverImageKey?: Prisma.StringNullableFilter<"Bonsai"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Bonsai"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Bonsai"> | Date | string;
    userId?: Prisma.StringNullableFilter<"Bonsai"> | string | null;
    user?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
    media?: Prisma.MediaListRelationFilter;
    aiAdvices?: Prisma.AIAdviceListRelationFilter;
};
export type BonsaiOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    owner?: Prisma.SortOrder;
    visibility?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    nickname?: Prisma.SortOrderInput | Prisma.SortOrder;
    species?: Prisma.SortOrderInput | Prisma.SortOrder;
    acquiredAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    estimatedAge?: Prisma.SortOrderInput | Prisma.SortOrder;
    origin?: Prisma.SortOrderInput | Prisma.SortOrder;
    potInfo?: Prisma.SortOrderInput | Prisma.SortOrder;
    style?: Prisma.SortOrderInput | Prisma.SortOrder;
    currentState?: Prisma.SortOrderInput | Prisma.SortOrder;
    coverImageKey?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    userId?: Prisma.SortOrderInput | Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
    media?: Prisma.MediaOrderByRelationAggregateInput;
    aiAdvices?: Prisma.AIAdviceOrderByRelationAggregateInput;
};
export type BonsaiWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.BonsaiWhereInput | Prisma.BonsaiWhereInput[];
    OR?: Prisma.BonsaiWhereInput[];
    NOT?: Prisma.BonsaiWhereInput | Prisma.BonsaiWhereInput[];
    owner?: Prisma.StringFilter<"Bonsai"> | string;
    visibility?: Prisma.EnumBonsaiVisibilityFilter<"Bonsai"> | $Enums.BonsaiVisibility;
    name?: Prisma.StringFilter<"Bonsai"> | string;
    nickname?: Prisma.StringNullableFilter<"Bonsai"> | string | null;
    species?: Prisma.StringNullableFilter<"Bonsai"> | string | null;
    acquiredAt?: Prisma.DateTimeNullableFilter<"Bonsai"> | Date | string | null;
    estimatedAge?: Prisma.IntNullableFilter<"Bonsai"> | number | null;
    origin?: Prisma.StringNullableFilter<"Bonsai"> | string | null;
    potInfo?: Prisma.StringNullableFilter<"Bonsai"> | string | null;
    style?: Prisma.StringNullableFilter<"Bonsai"> | string | null;
    currentState?: Prisma.StringNullableFilter<"Bonsai"> | string | null;
    coverImageKey?: Prisma.StringNullableFilter<"Bonsai"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Bonsai"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Bonsai"> | Date | string;
    userId?: Prisma.StringNullableFilter<"Bonsai"> | string | null;
    user?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
    media?: Prisma.MediaListRelationFilter;
    aiAdvices?: Prisma.AIAdviceListRelationFilter;
}, "id">;
export type BonsaiOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    owner?: Prisma.SortOrder;
    visibility?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    nickname?: Prisma.SortOrderInput | Prisma.SortOrder;
    species?: Prisma.SortOrderInput | Prisma.SortOrder;
    acquiredAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    estimatedAge?: Prisma.SortOrderInput | Prisma.SortOrder;
    origin?: Prisma.SortOrderInput | Prisma.SortOrder;
    potInfo?: Prisma.SortOrderInput | Prisma.SortOrder;
    style?: Prisma.SortOrderInput | Prisma.SortOrder;
    currentState?: Prisma.SortOrderInput | Prisma.SortOrder;
    coverImageKey?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    userId?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.BonsaiCountOrderByAggregateInput;
    _avg?: Prisma.BonsaiAvgOrderByAggregateInput;
    _max?: Prisma.BonsaiMaxOrderByAggregateInput;
    _min?: Prisma.BonsaiMinOrderByAggregateInput;
    _sum?: Prisma.BonsaiSumOrderByAggregateInput;
};
export type BonsaiScalarWhereWithAggregatesInput = {
    AND?: Prisma.BonsaiScalarWhereWithAggregatesInput | Prisma.BonsaiScalarWhereWithAggregatesInput[];
    OR?: Prisma.BonsaiScalarWhereWithAggregatesInput[];
    NOT?: Prisma.BonsaiScalarWhereWithAggregatesInput | Prisma.BonsaiScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Bonsai"> | string;
    owner?: Prisma.StringWithAggregatesFilter<"Bonsai"> | string;
    visibility?: Prisma.EnumBonsaiVisibilityWithAggregatesFilter<"Bonsai"> | $Enums.BonsaiVisibility;
    name?: Prisma.StringWithAggregatesFilter<"Bonsai"> | string;
    nickname?: Prisma.StringNullableWithAggregatesFilter<"Bonsai"> | string | null;
    species?: Prisma.StringNullableWithAggregatesFilter<"Bonsai"> | string | null;
    acquiredAt?: Prisma.DateTimeNullableWithAggregatesFilter<"Bonsai"> | Date | string | null;
    estimatedAge?: Prisma.IntNullableWithAggregatesFilter<"Bonsai"> | number | null;
    origin?: Prisma.StringNullableWithAggregatesFilter<"Bonsai"> | string | null;
    potInfo?: Prisma.StringNullableWithAggregatesFilter<"Bonsai"> | string | null;
    style?: Prisma.StringNullableWithAggregatesFilter<"Bonsai"> | string | null;
    currentState?: Prisma.StringNullableWithAggregatesFilter<"Bonsai"> | string | null;
    coverImageKey?: Prisma.StringNullableWithAggregatesFilter<"Bonsai"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Bonsai"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Bonsai"> | Date | string;
    userId?: Prisma.StringNullableWithAggregatesFilter<"Bonsai"> | string | null;
};
export type BonsaiCreateInput = {
    id?: string;
    owner: string;
    visibility?: $Enums.BonsaiVisibility;
    name: string;
    nickname?: string | null;
    species?: string | null;
    acquiredAt?: Date | string | null;
    estimatedAge?: number | null;
    origin?: string | null;
    potInfo?: string | null;
    style?: string | null;
    currentState?: string | null;
    coverImageKey?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user?: Prisma.UserCreateNestedOneWithoutBonsaisInput;
    media?: Prisma.MediaCreateNestedManyWithoutBonsaiInput;
    aiAdvices?: Prisma.AIAdviceCreateNestedManyWithoutBonsaiInput;
};
export type BonsaiUncheckedCreateInput = {
    id?: string;
    owner: string;
    visibility?: $Enums.BonsaiVisibility;
    name: string;
    nickname?: string | null;
    species?: string | null;
    acquiredAt?: Date | string | null;
    estimatedAge?: number | null;
    origin?: string | null;
    potInfo?: string | null;
    style?: string | null;
    currentState?: string | null;
    coverImageKey?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    userId?: string | null;
    media?: Prisma.MediaUncheckedCreateNestedManyWithoutBonsaiInput;
    aiAdvices?: Prisma.AIAdviceUncheckedCreateNestedManyWithoutBonsaiInput;
};
export type BonsaiUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    owner?: Prisma.StringFieldUpdateOperationsInput | string;
    visibility?: Prisma.EnumBonsaiVisibilityFieldUpdateOperationsInput | $Enums.BonsaiVisibility;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    nickname?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    species?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    acquiredAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    estimatedAge?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    origin?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    potInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    style?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    currentState?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageKey?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneWithoutBonsaisNestedInput;
    media?: Prisma.MediaUpdateManyWithoutBonsaiNestedInput;
    aiAdvices?: Prisma.AIAdviceUpdateManyWithoutBonsaiNestedInput;
};
export type BonsaiUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    owner?: Prisma.StringFieldUpdateOperationsInput | string;
    visibility?: Prisma.EnumBonsaiVisibilityFieldUpdateOperationsInput | $Enums.BonsaiVisibility;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    nickname?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    species?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    acquiredAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    estimatedAge?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    origin?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    potInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    style?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    currentState?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageKey?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    media?: Prisma.MediaUncheckedUpdateManyWithoutBonsaiNestedInput;
    aiAdvices?: Prisma.AIAdviceUncheckedUpdateManyWithoutBonsaiNestedInput;
};
export type BonsaiCreateManyInput = {
    id?: string;
    owner: string;
    visibility?: $Enums.BonsaiVisibility;
    name: string;
    nickname?: string | null;
    species?: string | null;
    acquiredAt?: Date | string | null;
    estimatedAge?: number | null;
    origin?: string | null;
    potInfo?: string | null;
    style?: string | null;
    currentState?: string | null;
    coverImageKey?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    userId?: string | null;
};
export type BonsaiUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    owner?: Prisma.StringFieldUpdateOperationsInput | string;
    visibility?: Prisma.EnumBonsaiVisibilityFieldUpdateOperationsInput | $Enums.BonsaiVisibility;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    nickname?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    species?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    acquiredAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    estimatedAge?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    origin?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    potInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    style?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    currentState?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageKey?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type BonsaiUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    owner?: Prisma.StringFieldUpdateOperationsInput | string;
    visibility?: Prisma.EnumBonsaiVisibilityFieldUpdateOperationsInput | $Enums.BonsaiVisibility;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    nickname?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    species?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    acquiredAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    estimatedAge?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    origin?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    potInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    style?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    currentState?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageKey?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type BonsaiListRelationFilter = {
    every?: Prisma.BonsaiWhereInput;
    some?: Prisma.BonsaiWhereInput;
    none?: Prisma.BonsaiWhereInput;
};
export type BonsaiOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type BonsaiCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    owner?: Prisma.SortOrder;
    visibility?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    nickname?: Prisma.SortOrder;
    species?: Prisma.SortOrder;
    acquiredAt?: Prisma.SortOrder;
    estimatedAge?: Prisma.SortOrder;
    origin?: Prisma.SortOrder;
    potInfo?: Prisma.SortOrder;
    style?: Prisma.SortOrder;
    currentState?: Prisma.SortOrder;
    coverImageKey?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
};
export type BonsaiAvgOrderByAggregateInput = {
    estimatedAge?: Prisma.SortOrder;
};
export type BonsaiMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    owner?: Prisma.SortOrder;
    visibility?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    nickname?: Prisma.SortOrder;
    species?: Prisma.SortOrder;
    acquiredAt?: Prisma.SortOrder;
    estimatedAge?: Prisma.SortOrder;
    origin?: Prisma.SortOrder;
    potInfo?: Prisma.SortOrder;
    style?: Prisma.SortOrder;
    currentState?: Prisma.SortOrder;
    coverImageKey?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
};
export type BonsaiMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    owner?: Prisma.SortOrder;
    visibility?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    nickname?: Prisma.SortOrder;
    species?: Prisma.SortOrder;
    acquiredAt?: Prisma.SortOrder;
    estimatedAge?: Prisma.SortOrder;
    origin?: Prisma.SortOrder;
    potInfo?: Prisma.SortOrder;
    style?: Prisma.SortOrder;
    currentState?: Prisma.SortOrder;
    coverImageKey?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
};
export type BonsaiSumOrderByAggregateInput = {
    estimatedAge?: Prisma.SortOrder;
};
export type BonsaiScalarRelationFilter = {
    is?: Prisma.BonsaiWhereInput;
    isNot?: Prisma.BonsaiWhereInput;
};
export type BonsaiCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.BonsaiCreateWithoutUserInput, Prisma.BonsaiUncheckedCreateWithoutUserInput> | Prisma.BonsaiCreateWithoutUserInput[] | Prisma.BonsaiUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.BonsaiCreateOrConnectWithoutUserInput | Prisma.BonsaiCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.BonsaiCreateManyUserInputEnvelope;
    connect?: Prisma.BonsaiWhereUniqueInput | Prisma.BonsaiWhereUniqueInput[];
};
export type BonsaiUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.BonsaiCreateWithoutUserInput, Prisma.BonsaiUncheckedCreateWithoutUserInput> | Prisma.BonsaiCreateWithoutUserInput[] | Prisma.BonsaiUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.BonsaiCreateOrConnectWithoutUserInput | Prisma.BonsaiCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.BonsaiCreateManyUserInputEnvelope;
    connect?: Prisma.BonsaiWhereUniqueInput | Prisma.BonsaiWhereUniqueInput[];
};
export type BonsaiUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.BonsaiCreateWithoutUserInput, Prisma.BonsaiUncheckedCreateWithoutUserInput> | Prisma.BonsaiCreateWithoutUserInput[] | Prisma.BonsaiUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.BonsaiCreateOrConnectWithoutUserInput | Prisma.BonsaiCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.BonsaiUpsertWithWhereUniqueWithoutUserInput | Prisma.BonsaiUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.BonsaiCreateManyUserInputEnvelope;
    set?: Prisma.BonsaiWhereUniqueInput | Prisma.BonsaiWhereUniqueInput[];
    disconnect?: Prisma.BonsaiWhereUniqueInput | Prisma.BonsaiWhereUniqueInput[];
    delete?: Prisma.BonsaiWhereUniqueInput | Prisma.BonsaiWhereUniqueInput[];
    connect?: Prisma.BonsaiWhereUniqueInput | Prisma.BonsaiWhereUniqueInput[];
    update?: Prisma.BonsaiUpdateWithWhereUniqueWithoutUserInput | Prisma.BonsaiUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.BonsaiUpdateManyWithWhereWithoutUserInput | Prisma.BonsaiUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.BonsaiScalarWhereInput | Prisma.BonsaiScalarWhereInput[];
};
export type BonsaiUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.BonsaiCreateWithoutUserInput, Prisma.BonsaiUncheckedCreateWithoutUserInput> | Prisma.BonsaiCreateWithoutUserInput[] | Prisma.BonsaiUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.BonsaiCreateOrConnectWithoutUserInput | Prisma.BonsaiCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.BonsaiUpsertWithWhereUniqueWithoutUserInput | Prisma.BonsaiUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.BonsaiCreateManyUserInputEnvelope;
    set?: Prisma.BonsaiWhereUniqueInput | Prisma.BonsaiWhereUniqueInput[];
    disconnect?: Prisma.BonsaiWhereUniqueInput | Prisma.BonsaiWhereUniqueInput[];
    delete?: Prisma.BonsaiWhereUniqueInput | Prisma.BonsaiWhereUniqueInput[];
    connect?: Prisma.BonsaiWhereUniqueInput | Prisma.BonsaiWhereUniqueInput[];
    update?: Prisma.BonsaiUpdateWithWhereUniqueWithoutUserInput | Prisma.BonsaiUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.BonsaiUpdateManyWithWhereWithoutUserInput | Prisma.BonsaiUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.BonsaiScalarWhereInput | Prisma.BonsaiScalarWhereInput[];
};
export type EnumBonsaiVisibilityFieldUpdateOperationsInput = {
    set?: $Enums.BonsaiVisibility;
};
export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null;
};
export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type BonsaiCreateNestedOneWithoutMediaInput = {
    create?: Prisma.XOR<Prisma.BonsaiCreateWithoutMediaInput, Prisma.BonsaiUncheckedCreateWithoutMediaInput>;
    connectOrCreate?: Prisma.BonsaiCreateOrConnectWithoutMediaInput;
    connect?: Prisma.BonsaiWhereUniqueInput;
};
export type BonsaiUpdateOneRequiredWithoutMediaNestedInput = {
    create?: Prisma.XOR<Prisma.BonsaiCreateWithoutMediaInput, Prisma.BonsaiUncheckedCreateWithoutMediaInput>;
    connectOrCreate?: Prisma.BonsaiCreateOrConnectWithoutMediaInput;
    upsert?: Prisma.BonsaiUpsertWithoutMediaInput;
    connect?: Prisma.BonsaiWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.BonsaiUpdateToOneWithWhereWithoutMediaInput, Prisma.BonsaiUpdateWithoutMediaInput>, Prisma.BonsaiUncheckedUpdateWithoutMediaInput>;
};
export type BonsaiCreateNestedOneWithoutAiAdvicesInput = {
    create?: Prisma.XOR<Prisma.BonsaiCreateWithoutAiAdvicesInput, Prisma.BonsaiUncheckedCreateWithoutAiAdvicesInput>;
    connectOrCreate?: Prisma.BonsaiCreateOrConnectWithoutAiAdvicesInput;
    connect?: Prisma.BonsaiWhereUniqueInput;
};
export type BonsaiUpdateOneRequiredWithoutAiAdvicesNestedInput = {
    create?: Prisma.XOR<Prisma.BonsaiCreateWithoutAiAdvicesInput, Prisma.BonsaiUncheckedCreateWithoutAiAdvicesInput>;
    connectOrCreate?: Prisma.BonsaiCreateOrConnectWithoutAiAdvicesInput;
    upsert?: Prisma.BonsaiUpsertWithoutAiAdvicesInput;
    connect?: Prisma.BonsaiWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.BonsaiUpdateToOneWithWhereWithoutAiAdvicesInput, Prisma.BonsaiUpdateWithoutAiAdvicesInput>, Prisma.BonsaiUncheckedUpdateWithoutAiAdvicesInput>;
};
export type BonsaiCreateWithoutUserInput = {
    id?: string;
    owner: string;
    visibility?: $Enums.BonsaiVisibility;
    name: string;
    nickname?: string | null;
    species?: string | null;
    acquiredAt?: Date | string | null;
    estimatedAge?: number | null;
    origin?: string | null;
    potInfo?: string | null;
    style?: string | null;
    currentState?: string | null;
    coverImageKey?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    media?: Prisma.MediaCreateNestedManyWithoutBonsaiInput;
    aiAdvices?: Prisma.AIAdviceCreateNestedManyWithoutBonsaiInput;
};
export type BonsaiUncheckedCreateWithoutUserInput = {
    id?: string;
    owner: string;
    visibility?: $Enums.BonsaiVisibility;
    name: string;
    nickname?: string | null;
    species?: string | null;
    acquiredAt?: Date | string | null;
    estimatedAge?: number | null;
    origin?: string | null;
    potInfo?: string | null;
    style?: string | null;
    currentState?: string | null;
    coverImageKey?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    media?: Prisma.MediaUncheckedCreateNestedManyWithoutBonsaiInput;
    aiAdvices?: Prisma.AIAdviceUncheckedCreateNestedManyWithoutBonsaiInput;
};
export type BonsaiCreateOrConnectWithoutUserInput = {
    where: Prisma.BonsaiWhereUniqueInput;
    create: Prisma.XOR<Prisma.BonsaiCreateWithoutUserInput, Prisma.BonsaiUncheckedCreateWithoutUserInput>;
};
export type BonsaiCreateManyUserInputEnvelope = {
    data: Prisma.BonsaiCreateManyUserInput | Prisma.BonsaiCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type BonsaiUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.BonsaiWhereUniqueInput;
    update: Prisma.XOR<Prisma.BonsaiUpdateWithoutUserInput, Prisma.BonsaiUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.BonsaiCreateWithoutUserInput, Prisma.BonsaiUncheckedCreateWithoutUserInput>;
};
export type BonsaiUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.BonsaiWhereUniqueInput;
    data: Prisma.XOR<Prisma.BonsaiUpdateWithoutUserInput, Prisma.BonsaiUncheckedUpdateWithoutUserInput>;
};
export type BonsaiUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.BonsaiScalarWhereInput;
    data: Prisma.XOR<Prisma.BonsaiUpdateManyMutationInput, Prisma.BonsaiUncheckedUpdateManyWithoutUserInput>;
};
export type BonsaiScalarWhereInput = {
    AND?: Prisma.BonsaiScalarWhereInput | Prisma.BonsaiScalarWhereInput[];
    OR?: Prisma.BonsaiScalarWhereInput[];
    NOT?: Prisma.BonsaiScalarWhereInput | Prisma.BonsaiScalarWhereInput[];
    id?: Prisma.StringFilter<"Bonsai"> | string;
    owner?: Prisma.StringFilter<"Bonsai"> | string;
    visibility?: Prisma.EnumBonsaiVisibilityFilter<"Bonsai"> | $Enums.BonsaiVisibility;
    name?: Prisma.StringFilter<"Bonsai"> | string;
    nickname?: Prisma.StringNullableFilter<"Bonsai"> | string | null;
    species?: Prisma.StringNullableFilter<"Bonsai"> | string | null;
    acquiredAt?: Prisma.DateTimeNullableFilter<"Bonsai"> | Date | string | null;
    estimatedAge?: Prisma.IntNullableFilter<"Bonsai"> | number | null;
    origin?: Prisma.StringNullableFilter<"Bonsai"> | string | null;
    potInfo?: Prisma.StringNullableFilter<"Bonsai"> | string | null;
    style?: Prisma.StringNullableFilter<"Bonsai"> | string | null;
    currentState?: Prisma.StringNullableFilter<"Bonsai"> | string | null;
    coverImageKey?: Prisma.StringNullableFilter<"Bonsai"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Bonsai"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Bonsai"> | Date | string;
    userId?: Prisma.StringNullableFilter<"Bonsai"> | string | null;
};
export type BonsaiCreateWithoutMediaInput = {
    id?: string;
    owner: string;
    visibility?: $Enums.BonsaiVisibility;
    name: string;
    nickname?: string | null;
    species?: string | null;
    acquiredAt?: Date | string | null;
    estimatedAge?: number | null;
    origin?: string | null;
    potInfo?: string | null;
    style?: string | null;
    currentState?: string | null;
    coverImageKey?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user?: Prisma.UserCreateNestedOneWithoutBonsaisInput;
    aiAdvices?: Prisma.AIAdviceCreateNestedManyWithoutBonsaiInput;
};
export type BonsaiUncheckedCreateWithoutMediaInput = {
    id?: string;
    owner: string;
    visibility?: $Enums.BonsaiVisibility;
    name: string;
    nickname?: string | null;
    species?: string | null;
    acquiredAt?: Date | string | null;
    estimatedAge?: number | null;
    origin?: string | null;
    potInfo?: string | null;
    style?: string | null;
    currentState?: string | null;
    coverImageKey?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    userId?: string | null;
    aiAdvices?: Prisma.AIAdviceUncheckedCreateNestedManyWithoutBonsaiInput;
};
export type BonsaiCreateOrConnectWithoutMediaInput = {
    where: Prisma.BonsaiWhereUniqueInput;
    create: Prisma.XOR<Prisma.BonsaiCreateWithoutMediaInput, Prisma.BonsaiUncheckedCreateWithoutMediaInput>;
};
export type BonsaiUpsertWithoutMediaInput = {
    update: Prisma.XOR<Prisma.BonsaiUpdateWithoutMediaInput, Prisma.BonsaiUncheckedUpdateWithoutMediaInput>;
    create: Prisma.XOR<Prisma.BonsaiCreateWithoutMediaInput, Prisma.BonsaiUncheckedCreateWithoutMediaInput>;
    where?: Prisma.BonsaiWhereInput;
};
export type BonsaiUpdateToOneWithWhereWithoutMediaInput = {
    where?: Prisma.BonsaiWhereInput;
    data: Prisma.XOR<Prisma.BonsaiUpdateWithoutMediaInput, Prisma.BonsaiUncheckedUpdateWithoutMediaInput>;
};
export type BonsaiUpdateWithoutMediaInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    owner?: Prisma.StringFieldUpdateOperationsInput | string;
    visibility?: Prisma.EnumBonsaiVisibilityFieldUpdateOperationsInput | $Enums.BonsaiVisibility;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    nickname?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    species?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    acquiredAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    estimatedAge?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    origin?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    potInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    style?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    currentState?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageKey?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneWithoutBonsaisNestedInput;
    aiAdvices?: Prisma.AIAdviceUpdateManyWithoutBonsaiNestedInput;
};
export type BonsaiUncheckedUpdateWithoutMediaInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    owner?: Prisma.StringFieldUpdateOperationsInput | string;
    visibility?: Prisma.EnumBonsaiVisibilityFieldUpdateOperationsInput | $Enums.BonsaiVisibility;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    nickname?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    species?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    acquiredAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    estimatedAge?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    origin?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    potInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    style?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    currentState?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageKey?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    aiAdvices?: Prisma.AIAdviceUncheckedUpdateManyWithoutBonsaiNestedInput;
};
export type BonsaiCreateWithoutAiAdvicesInput = {
    id?: string;
    owner: string;
    visibility?: $Enums.BonsaiVisibility;
    name: string;
    nickname?: string | null;
    species?: string | null;
    acquiredAt?: Date | string | null;
    estimatedAge?: number | null;
    origin?: string | null;
    potInfo?: string | null;
    style?: string | null;
    currentState?: string | null;
    coverImageKey?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user?: Prisma.UserCreateNestedOneWithoutBonsaisInput;
    media?: Prisma.MediaCreateNestedManyWithoutBonsaiInput;
};
export type BonsaiUncheckedCreateWithoutAiAdvicesInput = {
    id?: string;
    owner: string;
    visibility?: $Enums.BonsaiVisibility;
    name: string;
    nickname?: string | null;
    species?: string | null;
    acquiredAt?: Date | string | null;
    estimatedAge?: number | null;
    origin?: string | null;
    potInfo?: string | null;
    style?: string | null;
    currentState?: string | null;
    coverImageKey?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    userId?: string | null;
    media?: Prisma.MediaUncheckedCreateNestedManyWithoutBonsaiInput;
};
export type BonsaiCreateOrConnectWithoutAiAdvicesInput = {
    where: Prisma.BonsaiWhereUniqueInput;
    create: Prisma.XOR<Prisma.BonsaiCreateWithoutAiAdvicesInput, Prisma.BonsaiUncheckedCreateWithoutAiAdvicesInput>;
};
export type BonsaiUpsertWithoutAiAdvicesInput = {
    update: Prisma.XOR<Prisma.BonsaiUpdateWithoutAiAdvicesInput, Prisma.BonsaiUncheckedUpdateWithoutAiAdvicesInput>;
    create: Prisma.XOR<Prisma.BonsaiCreateWithoutAiAdvicesInput, Prisma.BonsaiUncheckedCreateWithoutAiAdvicesInput>;
    where?: Prisma.BonsaiWhereInput;
};
export type BonsaiUpdateToOneWithWhereWithoutAiAdvicesInput = {
    where?: Prisma.BonsaiWhereInput;
    data: Prisma.XOR<Prisma.BonsaiUpdateWithoutAiAdvicesInput, Prisma.BonsaiUncheckedUpdateWithoutAiAdvicesInput>;
};
export type BonsaiUpdateWithoutAiAdvicesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    owner?: Prisma.StringFieldUpdateOperationsInput | string;
    visibility?: Prisma.EnumBonsaiVisibilityFieldUpdateOperationsInput | $Enums.BonsaiVisibility;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    nickname?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    species?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    acquiredAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    estimatedAge?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    origin?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    potInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    style?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    currentState?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageKey?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneWithoutBonsaisNestedInput;
    media?: Prisma.MediaUpdateManyWithoutBonsaiNestedInput;
};
export type BonsaiUncheckedUpdateWithoutAiAdvicesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    owner?: Prisma.StringFieldUpdateOperationsInput | string;
    visibility?: Prisma.EnumBonsaiVisibilityFieldUpdateOperationsInput | $Enums.BonsaiVisibility;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    nickname?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    species?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    acquiredAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    estimatedAge?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    origin?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    potInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    style?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    currentState?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageKey?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    media?: Prisma.MediaUncheckedUpdateManyWithoutBonsaiNestedInput;
};
export type BonsaiCreateManyUserInput = {
    id?: string;
    owner: string;
    visibility?: $Enums.BonsaiVisibility;
    name: string;
    nickname?: string | null;
    species?: string | null;
    acquiredAt?: Date | string | null;
    estimatedAge?: number | null;
    origin?: string | null;
    potInfo?: string | null;
    style?: string | null;
    currentState?: string | null;
    coverImageKey?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type BonsaiUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    owner?: Prisma.StringFieldUpdateOperationsInput | string;
    visibility?: Prisma.EnumBonsaiVisibilityFieldUpdateOperationsInput | $Enums.BonsaiVisibility;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    nickname?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    species?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    acquiredAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    estimatedAge?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    origin?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    potInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    style?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    currentState?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageKey?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    media?: Prisma.MediaUpdateManyWithoutBonsaiNestedInput;
    aiAdvices?: Prisma.AIAdviceUpdateManyWithoutBonsaiNestedInput;
};
export type BonsaiUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    owner?: Prisma.StringFieldUpdateOperationsInput | string;
    visibility?: Prisma.EnumBonsaiVisibilityFieldUpdateOperationsInput | $Enums.BonsaiVisibility;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    nickname?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    species?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    acquiredAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    estimatedAge?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    origin?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    potInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    style?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    currentState?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageKey?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    media?: Prisma.MediaUncheckedUpdateManyWithoutBonsaiNestedInput;
    aiAdvices?: Prisma.AIAdviceUncheckedUpdateManyWithoutBonsaiNestedInput;
};
export type BonsaiUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    owner?: Prisma.StringFieldUpdateOperationsInput | string;
    visibility?: Prisma.EnumBonsaiVisibilityFieldUpdateOperationsInput | $Enums.BonsaiVisibility;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    nickname?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    species?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    acquiredAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    estimatedAge?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    origin?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    potInfo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    style?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    currentState?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageKey?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type BonsaiCountOutputType = {
    media: number;
    aiAdvices: number;
};
export type BonsaiCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    media?: boolean | BonsaiCountOutputTypeCountMediaArgs;
    aiAdvices?: boolean | BonsaiCountOutputTypeCountAiAdvicesArgs;
};
export type BonsaiCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BonsaiCountOutputTypeSelect<ExtArgs> | null;
};
export type BonsaiCountOutputTypeCountMediaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MediaWhereInput;
};
export type BonsaiCountOutputTypeCountAiAdvicesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AIAdviceWhereInput;
};
export type BonsaiSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    owner?: boolean;
    visibility?: boolean;
    name?: boolean;
    nickname?: boolean;
    species?: boolean;
    acquiredAt?: boolean;
    estimatedAge?: boolean;
    origin?: boolean;
    potInfo?: boolean;
    style?: boolean;
    currentState?: boolean;
    coverImageKey?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    userId?: boolean;
    user?: boolean | Prisma.Bonsai$userArgs<ExtArgs>;
    media?: boolean | Prisma.Bonsai$mediaArgs<ExtArgs>;
    aiAdvices?: boolean | Prisma.Bonsai$aiAdvicesArgs<ExtArgs>;
    _count?: boolean | Prisma.BonsaiCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["bonsai"]>;
export type BonsaiSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    owner?: boolean;
    visibility?: boolean;
    name?: boolean;
    nickname?: boolean;
    species?: boolean;
    acquiredAt?: boolean;
    estimatedAge?: boolean;
    origin?: boolean;
    potInfo?: boolean;
    style?: boolean;
    currentState?: boolean;
    coverImageKey?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    userId?: boolean;
    user?: boolean | Prisma.Bonsai$userArgs<ExtArgs>;
}, ExtArgs["result"]["bonsai"]>;
export type BonsaiSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    owner?: boolean;
    visibility?: boolean;
    name?: boolean;
    nickname?: boolean;
    species?: boolean;
    acquiredAt?: boolean;
    estimatedAge?: boolean;
    origin?: boolean;
    potInfo?: boolean;
    style?: boolean;
    currentState?: boolean;
    coverImageKey?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    userId?: boolean;
    user?: boolean | Prisma.Bonsai$userArgs<ExtArgs>;
}, ExtArgs["result"]["bonsai"]>;
export type BonsaiSelectScalar = {
    id?: boolean;
    owner?: boolean;
    visibility?: boolean;
    name?: boolean;
    nickname?: boolean;
    species?: boolean;
    acquiredAt?: boolean;
    estimatedAge?: boolean;
    origin?: boolean;
    potInfo?: boolean;
    style?: boolean;
    currentState?: boolean;
    coverImageKey?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    userId?: boolean;
};
export type BonsaiOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "owner" | "visibility" | "name" | "nickname" | "species" | "acquiredAt" | "estimatedAge" | "origin" | "potInfo" | "style" | "currentState" | "coverImageKey" | "createdAt" | "updatedAt" | "userId", ExtArgs["result"]["bonsai"]>;
export type BonsaiInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.Bonsai$userArgs<ExtArgs>;
    media?: boolean | Prisma.Bonsai$mediaArgs<ExtArgs>;
    aiAdvices?: boolean | Prisma.Bonsai$aiAdvicesArgs<ExtArgs>;
    _count?: boolean | Prisma.BonsaiCountOutputTypeDefaultArgs<ExtArgs>;
};
export type BonsaiIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.Bonsai$userArgs<ExtArgs>;
};
export type BonsaiIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.Bonsai$userArgs<ExtArgs>;
};
export type $BonsaiPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Bonsai";
    objects: {
        user: Prisma.$UserPayload<ExtArgs> | null;
        media: Prisma.$MediaPayload<ExtArgs>[];
        aiAdvices: Prisma.$AIAdvicePayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        owner: string;
        visibility: $Enums.BonsaiVisibility;
        name: string;
        nickname: string | null;
        species: string | null;
        acquiredAt: Date | null;
        estimatedAge: number | null;
        origin: string | null;
        potInfo: string | null;
        style: string | null;
        currentState: string | null;
        coverImageKey: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
    }, ExtArgs["result"]["bonsai"]>;
    composites: {};
};
export type BonsaiGetPayload<S extends boolean | null | undefined | BonsaiDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$BonsaiPayload, S>;
export type BonsaiCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<BonsaiFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: BonsaiCountAggregateInputType | true;
};
export interface BonsaiDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Bonsai'];
        meta: {
            name: 'Bonsai';
        };
    };
    findUnique<T extends BonsaiFindUniqueArgs>(args: Prisma.SelectSubset<T, BonsaiFindUniqueArgs<ExtArgs>>): Prisma.Prisma__BonsaiClient<runtime.Types.Result.GetResult<Prisma.$BonsaiPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends BonsaiFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, BonsaiFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__BonsaiClient<runtime.Types.Result.GetResult<Prisma.$BonsaiPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends BonsaiFindFirstArgs>(args?: Prisma.SelectSubset<T, BonsaiFindFirstArgs<ExtArgs>>): Prisma.Prisma__BonsaiClient<runtime.Types.Result.GetResult<Prisma.$BonsaiPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends BonsaiFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, BonsaiFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__BonsaiClient<runtime.Types.Result.GetResult<Prisma.$BonsaiPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends BonsaiFindManyArgs>(args?: Prisma.SelectSubset<T, BonsaiFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BonsaiPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends BonsaiCreateArgs>(args: Prisma.SelectSubset<T, BonsaiCreateArgs<ExtArgs>>): Prisma.Prisma__BonsaiClient<runtime.Types.Result.GetResult<Prisma.$BonsaiPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends BonsaiCreateManyArgs>(args?: Prisma.SelectSubset<T, BonsaiCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends BonsaiCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, BonsaiCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BonsaiPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends BonsaiDeleteArgs>(args: Prisma.SelectSubset<T, BonsaiDeleteArgs<ExtArgs>>): Prisma.Prisma__BonsaiClient<runtime.Types.Result.GetResult<Prisma.$BonsaiPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends BonsaiUpdateArgs>(args: Prisma.SelectSubset<T, BonsaiUpdateArgs<ExtArgs>>): Prisma.Prisma__BonsaiClient<runtime.Types.Result.GetResult<Prisma.$BonsaiPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends BonsaiDeleteManyArgs>(args?: Prisma.SelectSubset<T, BonsaiDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends BonsaiUpdateManyArgs>(args: Prisma.SelectSubset<T, BonsaiUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends BonsaiUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, BonsaiUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BonsaiPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends BonsaiUpsertArgs>(args: Prisma.SelectSubset<T, BonsaiUpsertArgs<ExtArgs>>): Prisma.Prisma__BonsaiClient<runtime.Types.Result.GetResult<Prisma.$BonsaiPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends BonsaiCountArgs>(args?: Prisma.Subset<T, BonsaiCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], BonsaiCountAggregateOutputType> : number>;
    aggregate<T extends BonsaiAggregateArgs>(args: Prisma.Subset<T, BonsaiAggregateArgs>): Prisma.PrismaPromise<GetBonsaiAggregateType<T>>;
    groupBy<T extends BonsaiGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: BonsaiGroupByArgs['orderBy'];
    } : {
        orderBy?: BonsaiGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, BonsaiGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBonsaiGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: BonsaiFieldRefs;
}
export interface Prisma__BonsaiClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.Bonsai$userArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Bonsai$userArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    media<T extends Prisma.Bonsai$mediaArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Bonsai$mediaArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MediaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    aiAdvices<T extends Prisma.Bonsai$aiAdvicesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Bonsai$aiAdvicesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AIAdvicePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface BonsaiFieldRefs {
    readonly id: Prisma.FieldRef<"Bonsai", 'String'>;
    readonly owner: Prisma.FieldRef<"Bonsai", 'String'>;
    readonly visibility: Prisma.FieldRef<"Bonsai", 'BonsaiVisibility'>;
    readonly name: Prisma.FieldRef<"Bonsai", 'String'>;
    readonly nickname: Prisma.FieldRef<"Bonsai", 'String'>;
    readonly species: Prisma.FieldRef<"Bonsai", 'String'>;
    readonly acquiredAt: Prisma.FieldRef<"Bonsai", 'DateTime'>;
    readonly estimatedAge: Prisma.FieldRef<"Bonsai", 'Int'>;
    readonly origin: Prisma.FieldRef<"Bonsai", 'String'>;
    readonly potInfo: Prisma.FieldRef<"Bonsai", 'String'>;
    readonly style: Prisma.FieldRef<"Bonsai", 'String'>;
    readonly currentState: Prisma.FieldRef<"Bonsai", 'String'>;
    readonly coverImageKey: Prisma.FieldRef<"Bonsai", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Bonsai", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Bonsai", 'DateTime'>;
    readonly userId: Prisma.FieldRef<"Bonsai", 'String'>;
}
export type BonsaiFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BonsaiSelect<ExtArgs> | null;
    omit?: Prisma.BonsaiOmit<ExtArgs> | null;
    include?: Prisma.BonsaiInclude<ExtArgs> | null;
    where: Prisma.BonsaiWhereUniqueInput;
};
export type BonsaiFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BonsaiSelect<ExtArgs> | null;
    omit?: Prisma.BonsaiOmit<ExtArgs> | null;
    include?: Prisma.BonsaiInclude<ExtArgs> | null;
    where: Prisma.BonsaiWhereUniqueInput;
};
export type BonsaiFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BonsaiSelect<ExtArgs> | null;
    omit?: Prisma.BonsaiOmit<ExtArgs> | null;
    include?: Prisma.BonsaiInclude<ExtArgs> | null;
    where?: Prisma.BonsaiWhereInput;
    orderBy?: Prisma.BonsaiOrderByWithRelationInput | Prisma.BonsaiOrderByWithRelationInput[];
    cursor?: Prisma.BonsaiWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.BonsaiScalarFieldEnum | Prisma.BonsaiScalarFieldEnum[];
};
export type BonsaiFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BonsaiSelect<ExtArgs> | null;
    omit?: Prisma.BonsaiOmit<ExtArgs> | null;
    include?: Prisma.BonsaiInclude<ExtArgs> | null;
    where?: Prisma.BonsaiWhereInput;
    orderBy?: Prisma.BonsaiOrderByWithRelationInput | Prisma.BonsaiOrderByWithRelationInput[];
    cursor?: Prisma.BonsaiWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.BonsaiScalarFieldEnum | Prisma.BonsaiScalarFieldEnum[];
};
export type BonsaiFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BonsaiSelect<ExtArgs> | null;
    omit?: Prisma.BonsaiOmit<ExtArgs> | null;
    include?: Prisma.BonsaiInclude<ExtArgs> | null;
    where?: Prisma.BonsaiWhereInput;
    orderBy?: Prisma.BonsaiOrderByWithRelationInput | Prisma.BonsaiOrderByWithRelationInput[];
    cursor?: Prisma.BonsaiWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.BonsaiScalarFieldEnum | Prisma.BonsaiScalarFieldEnum[];
};
export type BonsaiCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BonsaiSelect<ExtArgs> | null;
    omit?: Prisma.BonsaiOmit<ExtArgs> | null;
    include?: Prisma.BonsaiInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.BonsaiCreateInput, Prisma.BonsaiUncheckedCreateInput>;
};
export type BonsaiCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.BonsaiCreateManyInput | Prisma.BonsaiCreateManyInput[];
    skipDuplicates?: boolean;
};
export type BonsaiCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BonsaiSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.BonsaiOmit<ExtArgs> | null;
    data: Prisma.BonsaiCreateManyInput | Prisma.BonsaiCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.BonsaiIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type BonsaiUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BonsaiSelect<ExtArgs> | null;
    omit?: Prisma.BonsaiOmit<ExtArgs> | null;
    include?: Prisma.BonsaiInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.BonsaiUpdateInput, Prisma.BonsaiUncheckedUpdateInput>;
    where: Prisma.BonsaiWhereUniqueInput;
};
export type BonsaiUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.BonsaiUpdateManyMutationInput, Prisma.BonsaiUncheckedUpdateManyInput>;
    where?: Prisma.BonsaiWhereInput;
    limit?: number;
};
export type BonsaiUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BonsaiSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.BonsaiOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.BonsaiUpdateManyMutationInput, Prisma.BonsaiUncheckedUpdateManyInput>;
    where?: Prisma.BonsaiWhereInput;
    limit?: number;
    include?: Prisma.BonsaiIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type BonsaiUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BonsaiSelect<ExtArgs> | null;
    omit?: Prisma.BonsaiOmit<ExtArgs> | null;
    include?: Prisma.BonsaiInclude<ExtArgs> | null;
    where: Prisma.BonsaiWhereUniqueInput;
    create: Prisma.XOR<Prisma.BonsaiCreateInput, Prisma.BonsaiUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.BonsaiUpdateInput, Prisma.BonsaiUncheckedUpdateInput>;
};
export type BonsaiDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BonsaiSelect<ExtArgs> | null;
    omit?: Prisma.BonsaiOmit<ExtArgs> | null;
    include?: Prisma.BonsaiInclude<ExtArgs> | null;
    where: Prisma.BonsaiWhereUniqueInput;
};
export type BonsaiDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.BonsaiWhereInput;
    limit?: number;
};
export type Bonsai$userArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
};
export type Bonsai$mediaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MediaSelect<ExtArgs> | null;
    omit?: Prisma.MediaOmit<ExtArgs> | null;
    include?: Prisma.MediaInclude<ExtArgs> | null;
    where?: Prisma.MediaWhereInput;
    orderBy?: Prisma.MediaOrderByWithRelationInput | Prisma.MediaOrderByWithRelationInput[];
    cursor?: Prisma.MediaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MediaScalarFieldEnum | Prisma.MediaScalarFieldEnum[];
};
export type Bonsai$aiAdvicesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AIAdviceSelect<ExtArgs> | null;
    omit?: Prisma.AIAdviceOmit<ExtArgs> | null;
    include?: Prisma.AIAdviceInclude<ExtArgs> | null;
    where?: Prisma.AIAdviceWhereInput;
    orderBy?: Prisma.AIAdviceOrderByWithRelationInput | Prisma.AIAdviceOrderByWithRelationInput[];
    cursor?: Prisma.AIAdviceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AIAdviceScalarFieldEnum | Prisma.AIAdviceScalarFieldEnum[];
};
export type BonsaiDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BonsaiSelect<ExtArgs> | null;
    omit?: Prisma.BonsaiOmit<ExtArgs> | null;
    include?: Prisma.BonsaiInclude<ExtArgs> | null;
};
