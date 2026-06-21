"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BonsaiService = void 0;
const common_1 = require("@nestjs/common");
let BonsaiService = class BonsaiService {
    getBonsais() {
        return [];
    }
    getBonsai(id) {
        return { id };
    }
    createBonsai(createBonsaiDto) {
        return createBonsaiDto;
    }
    updateBonsai(id, updateBonsaiDto) {
        return { id, ...updateBonsaiDto };
    }
    deleteBonsai(id) {
        return { id, deleted: true };
    }
};
exports.BonsaiService = BonsaiService;
exports.BonsaiService = BonsaiService = __decorate([
    (0, common_1.Injectable)()
], BonsaiService);
//# sourceMappingURL=bonsai.service.js.map