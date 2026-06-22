"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const advice_module_1 = require("./advice/advice.module");
const bonsai_module_1 = require("./bonsai/bonsai.module");
const chat_module_1 = require("./chat/chat.module");
const me_module_1 = require("./me/me.module");
const media_module_1 = require("./media/media.module");
const prisma_module_1 = require("./prisma/prisma.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            bonsai_module_1.BonsaiModule,
            media_module_1.MediaModule,
            advice_module_1.AdviceModule,
            chat_module_1.ChatModule,
            me_module_1.MeModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map