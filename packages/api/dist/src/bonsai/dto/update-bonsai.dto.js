"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBonsaiDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_bonsai_dto_1 = require("./create-bonsai.dto");
class UpdateBonsaiDto extends (0, mapped_types_1.PartialType)(create_bonsai_dto_1.CreateBonsaiDto) {
}
exports.UpdateBonsaiDto = UpdateBonsaiDto;
//# sourceMappingURL=update-bonsai.dto.js.map