"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdviceService = exports.CreateAdviceDto = void 0;
const common_1 = require("@nestjs/common");
class CreateAdviceDto {
    mediaId;
}
exports.CreateAdviceDto = CreateAdviceDto;
let AdviceService = class AdviceService {
    createAdvice(bonsaiId, createAdviceDto) {
        return { bonsaiId, ...createAdviceDto };
    }
    getAdvices(bonsaiId) {
        return [];
    }
};
exports.AdviceService = AdviceService;
exports.AdviceService = AdviceService = __decorate([
    (0, common_1.Injectable)()
], AdviceService);
//# sourceMappingURL=advice.service.js.map