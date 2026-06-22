"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BonsaiService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const DEV_OWNER = 'dev-user-cognito-sub-TODO-replace-in-phase3';
let BonsaiService = class BonsaiService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBonsais() {
        return this.prisma.bonsai.findMany({ orderBy: { createdAt: 'desc' } });
    }
    async getBonsai(id) {
        const bonsai = await this.prisma.bonsai.findUnique({ where: { id } });
        if (!bonsai) {
            throw new common_1.NotFoundException(`Bonsai ${id} not found`);
        }
        return bonsai;
    }
    async createBonsai(createBonsaiDto) {
        return this.prisma.bonsai.create({
            data: {
                ...createBonsaiDto,
                owner: DEV_OWNER,
            },
        });
    }
    async updateBonsai(id, updateBonsaiDto) {
        await this.getBonsai(id);
        return this.prisma.bonsai.update({
            where: { id },
            data: updateBonsaiDto,
        });
    }
    async deleteBonsai(id) {
        await this.getBonsai(id);
        return this.prisma.bonsai.delete({ where: { id } });
    }
};
exports.BonsaiService = BonsaiService;
exports.BonsaiService = BonsaiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BonsaiService);
//# sourceMappingURL=bonsai.service.js.map