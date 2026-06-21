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
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const media_service_1 = require("./media.service");
let MediaController = class MediaController {
    mediaService;
    constructor(mediaService) {
        this.mediaService = mediaService;
    }
    getMedia(bonsaiId) {
        return this.mediaService.getMedia(bonsaiId);
    }
    presign() {
        return this.mediaService.presign();
    }
    createMedia(bonsaiId, createMediaDto) {
        return this.mediaService.createMedia(bonsaiId, createMediaDto);
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Get)('bonsai/:bonsaiId/media'),
    __param(0, (0, common_1.Param)('bonsaiId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "getMedia", null);
__decorate([
    (0, common_1.Post)('media/presign'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "presign", null);
__decorate([
    (0, common_1.Post)('bonsai/:bonsaiId/media'),
    __param(0, (0, common_1.Param)('bonsaiId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, media_service_1.CreateMediaDto]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "createMedia", null);
exports.MediaController = MediaController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [media_service_1.MediaService])
], MediaController);
//# sourceMappingURL=media.controller.js.map