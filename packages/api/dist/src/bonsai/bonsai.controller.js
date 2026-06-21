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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BonsaiController = void 0;
const common_1 = require("@nestjs/common");
const bonsai_service_1 = require("./bonsai.service");
const create_bonsai_dto_1 = require("./dto/create-bonsai.dto");
const update_bonsai_dto_1 = require("./dto/update-bonsai.dto");
let BonsaiController = class BonsaiController {
    bonsaiService;
    constructor(bonsaiService) {
        this.bonsaiService = bonsaiService;
    }
    getBonsais() {
        return this.bonsaiService.getBonsais();
    }
    getBonsai(id) {
        return this.bonsaiService.getBonsai(id);
    }
    createBonsai(createBonsaiDto) {
        return this.bonsaiService.createBonsai(createBonsaiDto);
    }
    updateBonsai(id, updateBonsaiDto) {
        return this.bonsaiService.updateBonsai(id, updateBonsaiDto);
    }
    deleteBonsai(id) {
        return this.bonsaiService.deleteBonsai(id);
    }
};
exports.BonsaiController = BonsaiController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BonsaiController.prototype, "getBonsais", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BonsaiController.prototype, "getBonsai", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_bonsai_dto_1.CreateBonsaiDto]),
    __metadata("design:returntype", void 0)
], BonsaiController.prototype, "createBonsai", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_bonsai_dto_1.UpdateBonsaiDto]),
    __metadata("design:returntype", void 0)
], BonsaiController.prototype, "updateBonsai", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BonsaiController.prototype, "deleteBonsai", null);
exports.BonsaiController = BonsaiController = __decorate([
    (0, common_1.Controller)('bonsai'),
    __metadata("design:paramtypes", [bonsai_service_1.BonsaiService])
], BonsaiController);
//# sourceMappingURL=bonsai.controller.js.map