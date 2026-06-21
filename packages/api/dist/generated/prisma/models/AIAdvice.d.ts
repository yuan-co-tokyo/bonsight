import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type AIAdviceModel = runtime.Types.Result.DefaultSelection<Prisma.$AIAdvicePayload>;
export type AggregateAIAdvice = {
    _count: AIAdviceCountAggregateOutputType | null;
    _avg: AIAdviceAvgAggregateOutputType | null;
    _sum: AIAdviceSumAggregateOutputType | null;
    _min: AIAdviceMinAggregateOutputType | null;
    _max: AIAdviceMaxAggregateOutputType | null;
};
export type AIAdviceAvgAggregateOutputType = {
    confidence: number | null;
};
export type AIAdviceSumAggregateOutputType = {
    confidence: number | null;
};
export type AIAdviceMinAggregateOutputType = {
    id: string | null;
    bonsaiId: string | null;
    mediaId: string | null;
    confidence: number | null;
    createdAt: Date | null;
};
export type AIAdviceMaxAggregateOutputType = {
    id: string | null;
    bonsaiId: string | null;
    mediaId: string | null;
    confidence: number | null;
    createdAt: Date | null;
};
export type AIAdviceCountAggregateOutputType = {
    id: number;
    bonsaiId: number;
    mediaId: number;
    diagnosis: number;
    confidence: number;
    createdAt: number;
    _all: number;
};
export type AIAdviceAvgAggregateInputType = {
    confidence?: true;
};
export type AIAdviceSumAggregateInputType = {
    confidence?: true;
};
export type AIAdviceMinAggregateInputType = {
    id?: true;
    bonsaiId?: true;
    mediaId?: true;
    confidence?: true;
    createdAt?: true;
};
export type AIAdviceMaxAggregateInputType = {
    id?: true;
    bonsaiId?: true;
    mediaId?: true;
    confidence?: true;
    createdAt?: true;
};
export type AIAdviceCountAggregateInputType = {
    id?: true;
    bonsaiId?: true;
    mediaId?: true;
    diagnosis?: true;
    confidence?: true;
    createdAt?: true;
    _all?: true;
};
export type AIAdviceAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AIAdviceWhereInput;
    orderBy?: Prisma.AIAdviceOrderByWithRelationInput | Prisma.AIAdviceOrderByWithRelationInput[];
    cursor?: Prisma.AIAdviceWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | AIAdviceCountAggregateInputType;
    _avg?: AIAdviceAvgAggregateInputType;
    _sum?: AIAdviceSumAggregateInputType;
    _min?: AIAdviceMinAggregateInputType;
    _max?: AIAdviceMaxAggregateInputType;
};
export type GetAIAdviceAggregateType<T extends AIAdviceAggregateArgs> = {
    [P in keyof T & keyof AggregateAIAdvice]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateAIAdvice[P]> : Prisma.GetScalarType<T[P], AggregateAIAdvice[P]>;
};
export type AIAdviceGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AIAdviceWhereInput;
    orderBy?: Prisma.AIAdviceOrderByWithAggregationInput | Prisma.AIAdviceOrderByWithAggregationInput[];
    by: Prisma.AIAdviceScalarFieldEnum[] | Prisma.AIAdviceScalarFieldEnum;
    having?: Prisma.AIAdviceScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: AIAdviceCountAggregateInputType | true;
    _avg?: AIAdviceAvgAggregateInputType;
    _sum?: AIAdviceSumAggregateInputType;
    _min?: AIAdviceMinAggregateInputType;
    _max?: AIAdviceMaxAggregateInputType;
};
export type AIAdviceGroupByOutputType = {
    id: string;
    bonsaiId: string;
    mediaId: string | null;
    diagnosis: runtime.JsonValue;
    confidence: number | null;
    createdAt: Date;
    _count: AIAdviceCountAggregateOutputType | null;
    _avg: AIAdviceAvgAggregateOutputType | null;
    _sum: AIAdviceSumAggregateOutputType | null;
    _min: AIAdviceMinAggregateOutputType | null;
    _max: AIAdviceMaxAggregateOutputType | null;
};
export type GetAIAdviceGroupByPayload<T extends AIAdviceGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<AIAdviceGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof AIAdviceGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], AIAdviceGroupByOutputType[P]> : Prisma.GetScalarType<T[P], AIAdviceGroupByOutputType[P]>;
}>>;
export type AIAdviceWhereInput = {
    AND?: Prisma.AIAdviceWhereInput | Prisma.AIAdviceWhereInput[];
    OR?: Prisma.AIAdviceWhereInput[];
    NOT?: Prisma.AIAdviceWhereInput | Prisma.AIAdviceWhereInput[];
    id?: Prisma.StringFilter<"AIAdvice"> | string;
    bonsaiId?: Prisma.StringFilter<"AIAdvice"> | string;
    mediaId?: Prisma.StringNullableFilter<"AIAdvice"> | string | null;
    diagnosis?: Prisma.JsonFilter<"AIAdvice">;
    confidence?: Prisma.FloatNullableFilter<"AIAdvice"> | number | null;
    createdAt?: Prisma.DateTimeFilter<"AIAdvice"> | Date | string;
    bonsai?: Prisma.XOR<Prisma.BonsaiScalarRelationFilter, Prisma.BonsaiWhereInput>;
};
export type AIAdviceOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    bonsaiId?: Prisma.SortOrder;
    mediaId?: Prisma.SortOrderInput | Prisma.SortOrder;
    diagnosis?: Prisma.SortOrder;
    confidence?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    bonsai?: Prisma.BonsaiOrderByWithRelationInput;
};
export type AIAdviceWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.AIAdviceWhereInput | Prisma.AIAdviceWhereInput[];
    OR?: Prisma.AIAdviceWhereInput[];
    NOT?: Prisma.AIAdviceWhereInput | Prisma.AIAdviceWhereInput[];
    bonsaiId?: Prisma.StringFilter<"AIAdvice"> | string;
    mediaId?: Prisma.StringNullableFilter<"AIAdvice"> | string | null;
    diagnosis?: Prisma.JsonFilter<"AIAdvice">;
    confidence?: Prisma.FloatNullableFilter<"AIAdvice"> | number | null;
    createdAt?: Prisma.DateTimeFilter<"AIAdvice"> | Date | string;
    bonsai?: Prisma.XOR<Prisma.BonsaiScalarRelationFilter, Prisma.BonsaiWhereInput>;
}, "id">;
export type AIAdviceOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    bonsaiId?: Prisma.SortOrder;
    mediaId?: Prisma.SortOrderInput | Prisma.SortOrder;
    diagnosis?: Prisma.SortOrder;
    confidence?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.AIAdviceCountOrderByAggregateInput;
    _avg?: Prisma.AIAdviceAvgOrderByAggregateInput;
    _max?: Prisma.AIAdviceMaxOrderByAggregateInput;
    _min?: Prisma.AIAdviceMinOrderByAggregateInput;
    _sum?: Prisma.AIAdviceSumOrderByAggregateInput;
};
export type AIAdviceScalarWhereWithAggregatesInput = {
    AND?: Prisma.AIAdviceScalarWhereWithAggregatesInput | Prisma.AIAdviceScalarWhereWithAggregatesInput[];
    OR?: Prisma.AIAdviceScalarWhereWithAggregatesInput[];
    NOT?: Prisma.AIAdviceScalarWhereWithAggregatesInput | Prisma.AIAdviceScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"AIAdvice"> | string;
    bonsaiId?: Prisma.StringWithAggregatesFilter<"AIAdvice"> | string;
    mediaId?: Prisma.StringNullableWithAggregatesFilter<"AIAdvice"> | string | null;
    diagnosis?: Prisma.JsonWithAggregatesFilter<"AIAdvice">;
    confidence?: Prisma.FloatNullableWithAggregatesFilter<"AIAdvice"> | number | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"AIAdvice"> | Date | string;
};
export type AIAdviceCreateInput = {
    id?: string;
    mediaId?: string | null;
    diagnosis: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    confidence?: number | null;
    createdAt?: Date | string;
    bonsai: Prisma.BonsaiCreateNestedOneWithoutAiAdvicesInput;
};
export type AIAdviceUncheckedCreateInput = {
    id?: string;
    bonsaiId: string;
    mediaId?: string | null;
    diagnosis: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    confidence?: number | null;
    createdAt?: Date | string;
};
export type AIAdviceUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    mediaId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    diagnosis?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    confidence?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    bonsai?: Prisma.BonsaiUpdateOneRequiredWithoutAiAdvicesNestedInput;
};
export type AIAdviceUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    bonsaiId?: Prisma.StringFieldUpdateOperationsInput | string;
    mediaId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    diagnosis?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    confidence?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AIAdviceCreateManyInput = {
    id?: string;
    bonsaiId: string;
    mediaId?: string | null;
    diagnosis: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    confidence?: number | null;
    createdAt?: Date | string;
};
export type AIAdviceUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    mediaId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    diagnosis?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    confidence?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AIAdviceUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    bonsaiId?: Prisma.StringFieldUpdateOperationsInput | string;
    mediaId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    diagnosis?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    confidence?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AIAdviceListRelationFilter = {
    every?: Prisma.AIAdviceWhereInput;
    some?: Prisma.AIAdviceWhereInput;
    none?: Prisma.AIAdviceWhereInput;
};
export type AIAdviceOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type AIAdviceCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    bonsaiId?: Prisma.SortOrder;
    mediaId?: Prisma.SortOrder;
    diagnosis?: Prisma.SortOrder;
    confidence?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type AIAdviceAvgOrderByAggregateInput = {
    confidence?: Prisma.SortOrder;
};
export type AIAdviceMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    bonsaiId?: Prisma.SortOrder;
    mediaId?: Prisma.SortOrder;
    confidence?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type AIAdviceMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    bonsaiId?: Prisma.SortOrder;
    mediaId?: Prisma.SortOrder;
    confidence?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type AIAdviceSumOrderByAggregateInput = {
    confidence?: Prisma.SortOrder;
};
export type AIAdviceCreateNestedManyWithoutBonsaiInput = {
    create?: Prisma.XOR<Prisma.AIAdviceCreateWithoutBonsaiInput, Prisma.AIAdviceUncheckedCreateWithoutBonsaiInput> | Prisma.AIAdviceCreateWithoutBonsaiInput[] | Prisma.AIAdviceUncheckedCreateWithoutBonsaiInput[];
    connectOrCreate?: Prisma.AIAdviceCreateOrConnectWithoutBonsaiInput | Prisma.AIAdviceCreateOrConnectWithoutBonsaiInput[];
    createMany?: Prisma.AIAdviceCreateManyBonsaiInputEnvelope;
    connect?: Prisma.AIAdviceWhereUniqueInput | Prisma.AIAdviceWhereUniqueInput[];
};
export type AIAdviceUncheckedCreateNestedManyWithoutBonsaiInput = {
    create?: Prisma.XOR<Prisma.AIAdviceCreateWithoutBonsaiInput, Prisma.AIAdviceUncheckedCreateWithoutBonsaiInput> | Prisma.AIAdviceCreateWithoutBonsaiInput[] | Prisma.AIAdviceUncheckedCreateWithoutBonsaiInput[];
    connectOrCreate?: Prisma.AIAdviceCreateOrConnectWithoutBonsaiInput | Prisma.AIAdviceCreateOrConnectWithoutBonsaiInput[];
    createMany?: Prisma.AIAdviceCreateManyBonsaiInputEnvelope;
    connect?: Prisma.AIAdviceWhereUniqueInput | Prisma.AIAdviceWhereUniqueInput[];
};
export type AIAdviceUpdateManyWithoutBonsaiNestedInput = {
    create?: Prisma.XOR<Prisma.AIAdviceCreateWithoutBonsaiInput, Prisma.AIAdviceUncheckedCreateWithoutBonsaiInput> | Prisma.AIAdviceCreateWithoutBonsaiInput[] | Prisma.AIAdviceUncheckedCreateWithoutBonsaiInput[];
    connectOrCreate?: Prisma.AIAdviceCreateOrConnectWithoutBonsaiInput | Prisma.AIAdviceCreateOrConnectWithoutBonsaiInput[];
    upsert?: Prisma.AIAdviceUpsertWithWhereUniqueWithoutBonsaiInput | Prisma.AIAdviceUpsertWithWhereUniqueWithoutBonsaiInput[];
    createMany?: Prisma.AIAdviceCreateManyBonsaiInputEnvelope;
    set?: Prisma.AIAdviceWhereUniqueInput | Prisma.AIAdviceWhereUniqueInput[];
    disconnect?: Prisma.AIAdviceWhereUniqueInput | Prisma.AIAdviceWhereUniqueInput[];
    delete?: Prisma.AIAdviceWhereUniqueInput | Prisma.AIAdviceWhereUniqueInput[];
    connect?: Prisma.AIAdviceWhereUniqueInput | Prisma.AIAdviceWhereUniqueInput[];
    update?: Prisma.AIAdviceUpdateWithWhereUniqueWithoutBonsaiInput | Prisma.AIAdviceUpdateWithWhereUniqueWithoutBonsaiInput[];
    updateMany?: Prisma.AIAdviceUpdateManyWithWhereWithoutBonsaiInput | Prisma.AIAdviceUpdateManyWithWhereWithoutBonsaiInput[];
    deleteMany?: Prisma.AIAdviceScalarWhereInput | Prisma.AIAdviceScalarWhereInput[];
};
export type AIAdviceUncheckedUpdateManyWithoutBonsaiNestedInput = {
    create?: Prisma.XOR<Prisma.AIAdviceCreateWithoutBonsaiInput, Prisma.AIAdviceUncheckedCreateWithoutBonsaiInput> | Prisma.AIAdviceCreateWithoutBonsaiInput[] | Prisma.AIAdviceUncheckedCreateWithoutBonsaiInput[];
    connectOrCreate?: Prisma.AIAdviceCreateOrConnectWithoutBonsaiInput | Prisma.AIAdviceCreateOrConnectWithoutBonsaiInput[];
    upsert?: Prisma.AIAdviceUpsertWithWhereUniqueWithoutBonsaiInput | Prisma.AIAdviceUpsertWithWhereUniqueWithoutBonsaiInput[];
    createMany?: Prisma.AIAdviceCreateManyBonsaiInputEnvelope;
    set?: Prisma.AIAdviceWhereUniqueInput | Prisma.AIAdviceWhereUniqueInput[];
    disconnect?: Prisma.AIAdviceWhereUniqueInput | Prisma.AIAdviceWhereUniqueInput[];
    delete?: Prisma.AIAdviceWhereUniqueInput | Prisma.AIAdviceWhereUniqueInput[];
    connect?: Prisma.AIAdviceWhereUniqueInput | Prisma.AIAdviceWhereUniqueInput[];
    update?: Prisma.AIAdviceUpdateWithWhereUniqueWithoutBonsaiInput | Prisma.AIAdviceUpdateWithWhereUniqueWithoutBonsaiInput[];
    updateMany?: Prisma.AIAdviceUpdateManyWithWhereWithoutBonsaiInput | Prisma.AIAdviceUpdateManyWithWhereWithoutBonsaiInput[];
    deleteMany?: Prisma.AIAdviceScalarWhereInput | Prisma.AIAdviceScalarWhereInput[];
};
export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type AIAdviceCreateWithoutBonsaiInput = {
    id?: string;
    mediaId?: string | null;
    diagnosis: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    confidence?: number | null;
    createdAt?: Date | string;
};
export type AIAdviceUncheckedCreateWithoutBonsaiInput = {
    id?: string;
    mediaId?: string | null;
    diagnosis: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    confidence?: number | null;
    createdAt?: Date | string;
};
export type AIAdviceCreateOrConnectWithoutBonsaiInput = {
    where: Prisma.AIAdviceWhereUniqueInput;
    create: Prisma.XOR<Prisma.AIAdviceCreateWithoutBonsaiInput, Prisma.AIAdviceUncheckedCreateWithoutBonsaiInput>;
};
export type AIAdviceCreateManyBonsaiInputEnvelope = {
    data: Prisma.AIAdviceCreateManyBonsaiInput | Prisma.AIAdviceCreateManyBonsaiInput[];
    skipDuplicates?: boolean;
};
export type AIAdviceUpsertWithWhereUniqueWithoutBonsaiInput = {
    where: Prisma.AIAdviceWhereUniqueInput;
    update: Prisma.XOR<Prisma.AIAdviceUpdateWithoutBonsaiInput, Prisma.AIAdviceUncheckedUpdateWithoutBonsaiInput>;
    create: Prisma.XOR<Prisma.AIAdviceCreateWithoutBonsaiInput, Prisma.AIAdviceUncheckedCreateWithoutBonsaiInput>;
};
export type AIAdviceUpdateWithWhereUniqueWithoutBonsaiInput = {
    where: Prisma.AIAdviceWhereUniqueInput;
    data: Prisma.XOR<Prisma.AIAdviceUpdateWithoutBonsaiInput, Prisma.AIAdviceUncheckedUpdateWithoutBonsaiInput>;
};
export type AIAdviceUpdateManyWithWhereWithoutBonsaiInput = {
    where: Prisma.AIAdviceScalarWhereInput;
    data: Prisma.XOR<Prisma.AIAdviceUpdateManyMutationInput, Prisma.AIAdviceUncheckedUpdateManyWithoutBonsaiInput>;
};
export type AIAdviceScalarWhereInput = {
    AND?: Prisma.AIAdviceScalarWhereInput | Prisma.AIAdviceScalarWhereInput[];
    OR?: Prisma.AIAdviceScalarWhereInput[];
    NOT?: Prisma.AIAdviceScalarWhereInput | Prisma.AIAdviceScalarWhereInput[];
    id?: Prisma.StringFilter<"AIAdvice"> | string;
    bonsaiId?: Prisma.StringFilter<"AIAdvice"> | string;
    mediaId?: Prisma.StringNullableFilter<"AIAdvice"> | string | null;
    diagnosis?: Prisma.JsonFilter<"AIAdvice">;
    confidence?: Prisma.FloatNullableFilter<"AIAdvice"> | number | null;
    createdAt?: Prisma.DateTimeFilter<"AIAdvice"> | Date | string;
};
export type AIAdviceCreateManyBonsaiInput = {
    id?: string;
    mediaId?: string | null;
    diagnosis: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    confidence?: number | null;
    createdAt?: Date | string;
};
export type AIAdviceUpdateWithoutBonsaiInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    mediaId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    diagnosis?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    confidence?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AIAdviceUncheckedUpdateWithoutBonsaiInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    mediaId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    diagnosis?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    confidence?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AIAdviceUncheckedUpdateManyWithoutBonsaiInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    mediaId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    diagnosis?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    confidence?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AIAdviceSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    bonsaiId?: boolean;
    mediaId?: boolean;
    diagnosis?: boolean;
    confidence?: boolean;
    createdAt?: boolean;
    bonsai?: boolean | Prisma.BonsaiDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["aIAdvice"]>;
export type AIAdviceSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    bonsaiId?: boolean;
    mediaId?: boolean;
    diagnosis?: boolean;
    confidence?: boolean;
    createdAt?: boolean;
    bonsai?: boolean | Prisma.BonsaiDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["aIAdvice"]>;
export type AIAdviceSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    bonsaiId?: boolean;
    mediaId?: boolean;
    diagnosis?: boolean;
    confidence?: boolean;
    createdAt?: boolean;
    bonsai?: boolean | Prisma.BonsaiDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["aIAdvice"]>;
export type AIAdviceSelectScalar = {
    id?: boolean;
    bonsaiId?: boolean;
    mediaId?: boolean;
    diagnosis?: boolean;
    confidence?: boolean;
    createdAt?: boolean;
};
export type AIAdviceOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "bonsaiId" | "mediaId" | "diagnosis" | "confidence" | "createdAt", ExtArgs["result"]["aIAdvice"]>;
export type AIAdviceInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    bonsai?: boolean | Prisma.BonsaiDefaultArgs<ExtArgs>;
};
export type AIAdviceIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    bonsai?: boolean | Prisma.BonsaiDefaultArgs<ExtArgs>;
};
export type AIAdviceIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    bonsai?: boolean | Prisma.BonsaiDefaultArgs<ExtArgs>;
};
export type $AIAdvicePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "AIAdvice";
    objects: {
        bonsai: Prisma.$BonsaiPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        bonsaiId: string;
        mediaId: string | null;
        diagnosis: runtime.JsonValue;
        confidence: number | null;
        createdAt: Date;
    }, ExtArgs["result"]["aIAdvice"]>;
    composites: {};
};
export type AIAdviceGetPayload<S extends boolean | null | undefined | AIAdviceDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$AIAdvicePayload, S>;
export type AIAdviceCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<AIAdviceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: AIAdviceCountAggregateInputType | true;
};
export interface AIAdviceDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['AIAdvice'];
        meta: {
            name: 'AIAdvice';
        };
    };
    findUnique<T extends AIAdviceFindUniqueArgs>(args: Prisma.SelectSubset<T, AIAdviceFindUniqueArgs<ExtArgs>>): Prisma.Prisma__AIAdviceClient<runtime.Types.Result.GetResult<Prisma.$AIAdvicePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends AIAdviceFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, AIAdviceFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__AIAdviceClient<runtime.Types.Result.GetResult<Prisma.$AIAdvicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends AIAdviceFindFirstArgs>(args?: Prisma.SelectSubset<T, AIAdviceFindFirstArgs<ExtArgs>>): Prisma.Prisma__AIAdviceClient<runtime.Types.Result.GetResult<Prisma.$AIAdvicePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends AIAdviceFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, AIAdviceFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__AIAdviceClient<runtime.Types.Result.GetResult<Prisma.$AIAdvicePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends AIAdviceFindManyArgs>(args?: Prisma.SelectSubset<T, AIAdviceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AIAdvicePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends AIAdviceCreateArgs>(args: Prisma.SelectSubset<T, AIAdviceCreateArgs<ExtArgs>>): Prisma.Prisma__AIAdviceClient<runtime.Types.Result.GetResult<Prisma.$AIAdvicePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends AIAdviceCreateManyArgs>(args?: Prisma.SelectSubset<T, AIAdviceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends AIAdviceCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, AIAdviceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AIAdvicePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends AIAdviceDeleteArgs>(args: Prisma.SelectSubset<T, AIAdviceDeleteArgs<ExtArgs>>): Prisma.Prisma__AIAdviceClient<runtime.Types.Result.GetResult<Prisma.$AIAdvicePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends AIAdviceUpdateArgs>(args: Prisma.SelectSubset<T, AIAdviceUpdateArgs<ExtArgs>>): Prisma.Prisma__AIAdviceClient<runtime.Types.Result.GetResult<Prisma.$AIAdvicePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends AIAdviceDeleteManyArgs>(args?: Prisma.SelectSubset<T, AIAdviceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends AIAdviceUpdateManyArgs>(args: Prisma.SelectSubset<T, AIAdviceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends AIAdviceUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, AIAdviceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AIAdvicePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends AIAdviceUpsertArgs>(args: Prisma.SelectSubset<T, AIAdviceUpsertArgs<ExtArgs>>): Prisma.Prisma__AIAdviceClient<runtime.Types.Result.GetResult<Prisma.$AIAdvicePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends AIAdviceCountArgs>(args?: Prisma.Subset<T, AIAdviceCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], AIAdviceCountAggregateOutputType> : number>;
    aggregate<T extends AIAdviceAggregateArgs>(args: Prisma.Subset<T, AIAdviceAggregateArgs>): Prisma.PrismaPromise<GetAIAdviceAggregateType<T>>;
    groupBy<T extends AIAdviceGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: AIAdviceGroupByArgs['orderBy'];
    } : {
        orderBy?: AIAdviceGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, AIAdviceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAIAdviceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: AIAdviceFieldRefs;
}
export interface Prisma__AIAdviceClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    bonsai<T extends Prisma.BonsaiDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.BonsaiDefaultArgs<ExtArgs>>): Prisma.Prisma__BonsaiClient<runtime.Types.Result.GetResult<Prisma.$BonsaiPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface AIAdviceFieldRefs {
    readonly id: Prisma.FieldRef<"AIAdvice", 'String'>;
    readonly bonsaiId: Prisma.FieldRef<"AIAdvice", 'String'>;
    readonly mediaId: Prisma.FieldRef<"AIAdvice", 'String'>;
    readonly diagnosis: Prisma.FieldRef<"AIAdvice", 'Json'>;
    readonly confidence: Prisma.FieldRef<"AIAdvice", 'Float'>;
    readonly createdAt: Prisma.FieldRef<"AIAdvice", 'DateTime'>;
}
export type AIAdviceFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AIAdviceSelect<ExtArgs> | null;
    omit?: Prisma.AIAdviceOmit<ExtArgs> | null;
    include?: Prisma.AIAdviceInclude<ExtArgs> | null;
    where: Prisma.AIAdviceWhereUniqueInput;
};
export type AIAdviceFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AIAdviceSelect<ExtArgs> | null;
    omit?: Prisma.AIAdviceOmit<ExtArgs> | null;
    include?: Prisma.AIAdviceInclude<ExtArgs> | null;
    where: Prisma.AIAdviceWhereUniqueInput;
};
export type AIAdviceFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type AIAdviceFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type AIAdviceFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type AIAdviceCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AIAdviceSelect<ExtArgs> | null;
    omit?: Prisma.AIAdviceOmit<ExtArgs> | null;
    include?: Prisma.AIAdviceInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AIAdviceCreateInput, Prisma.AIAdviceUncheckedCreateInput>;
};
export type AIAdviceCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.AIAdviceCreateManyInput | Prisma.AIAdviceCreateManyInput[];
    skipDuplicates?: boolean;
};
export type AIAdviceCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AIAdviceSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.AIAdviceOmit<ExtArgs> | null;
    data: Prisma.AIAdviceCreateManyInput | Prisma.AIAdviceCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.AIAdviceIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type AIAdviceUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AIAdviceSelect<ExtArgs> | null;
    omit?: Prisma.AIAdviceOmit<ExtArgs> | null;
    include?: Prisma.AIAdviceInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AIAdviceUpdateInput, Prisma.AIAdviceUncheckedUpdateInput>;
    where: Prisma.AIAdviceWhereUniqueInput;
};
export type AIAdviceUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.AIAdviceUpdateManyMutationInput, Prisma.AIAdviceUncheckedUpdateManyInput>;
    where?: Prisma.AIAdviceWhereInput;
    limit?: number;
};
export type AIAdviceUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AIAdviceSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.AIAdviceOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AIAdviceUpdateManyMutationInput, Prisma.AIAdviceUncheckedUpdateManyInput>;
    where?: Prisma.AIAdviceWhereInput;
    limit?: number;
    include?: Prisma.AIAdviceIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type AIAdviceUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AIAdviceSelect<ExtArgs> | null;
    omit?: Prisma.AIAdviceOmit<ExtArgs> | null;
    include?: Prisma.AIAdviceInclude<ExtArgs> | null;
    where: Prisma.AIAdviceWhereUniqueInput;
    create: Prisma.XOR<Prisma.AIAdviceCreateInput, Prisma.AIAdviceUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.AIAdviceUpdateInput, Prisma.AIAdviceUncheckedUpdateInput>;
};
export type AIAdviceDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AIAdviceSelect<ExtArgs> | null;
    omit?: Prisma.AIAdviceOmit<ExtArgs> | null;
    include?: Prisma.AIAdviceInclude<ExtArgs> | null;
    where: Prisma.AIAdviceWhereUniqueInput;
};
export type AIAdviceDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AIAdviceWhereInput;
    limit?: number;
};
export type AIAdviceDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AIAdviceSelect<ExtArgs> | null;
    omit?: Prisma.AIAdviceOmit<ExtArgs> | null;
    include?: Prisma.AIAdviceInclude<ExtArgs> | null;
};
