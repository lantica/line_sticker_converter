"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sharp_1 = __importDefault(require("sharp"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const regex = /^[0-9]{1,}@2x.png$/g;
(async function main() {
    if (process.argv.length < 3)
        throw new Error("No path is provided");
    const inputPath = process.argv[2];
    const outputPath = (process.argv.length > 3) ? process.argv[3] : process.argv[2];
    const files = await fs_1.promises.readdir(inputPath);
    const stickers = files.filter(file => { return regex.test(file); });
    console.log(`There are ${stickers.length} stickers in the sticker pack`);
    console.log("Going to convert");
    stickers.forEach(async (sticker) => {
        const im = await sharp_1.default(`${inputPath}/${sticker}`).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer().catch(console.error);
        //@ts-ignore
        await sharp_1.default(im).sharpen().png().toFile(`${outputPath}/${path_1.default.parse(sticker).name}_512.png`).catch(console.error);
    });
})().catch(console.error);
//# sourceMappingURL=convert.js.map