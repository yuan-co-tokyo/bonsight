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
exports.AdviceController = void 0;
const common_1 = require("@nestjs/common");
const advice_service_1 = require("./advice.service");
let AdviceController = class AdviceController {
    adviceService;
    constructor(adviceService) {
        this.adviceService = adviceService;
    }
    createAdvice(bonsaiId, createAdviceDto) {
        return this.adviceService.createAdvice(bonsaiId, createAdviceDto);
    }
    getAdvices(bonsaiId) {
        return this.adviceService.getAdvices(bonsaiId);
    }
};
exports.AdviceController = AdviceController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('bonsaiId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, advice_service_1.CreateAdviceDto]),
    __metadata("design:returntype", void 0)
], AdviceController.prototype, "createAdvice", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('bonsaiId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdviceController.prototype, "getAdvices", null);
exports.AdviceController = AdviceController = __decorate([
    (0, common_1.Controller)('bonsai/:bonsaiId/advice'),
    __metadata("design:paramtypes", [advice_service_1.AdviceService])
], AdviceController);
//# sourceMappingURL=advice.controller.js.map