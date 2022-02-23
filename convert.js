import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';
import axios from 'axios';
import os from 'os';
import { pipeline } from 'stream/promises';

const regex = /^[0-9]{1,}@2x.png$/g;

if (process.argv.length < 3) throw new Error("No path is provided");
const packId = process.argv[2];
if (!/^[0-9]{1,}/g.test(packId)) throw new Error("Invalid pack id");
const url = `https://stickershop.line-scdn.net/stickershop/v1/product/${packId}/iphone/stickers@2x.zip`;
const resp = await axios({
    method: 'get',
    url,
    responseType: 'stream'
});

const unzippedPath = path.resolve(os.tmpdir(), "sticker");
await pipeline(
  resp.data,
  unzipper.Extract({ path: unzippedPath })  
);

const files = await fs.promises.readdir(unzippedPath);
const stickers = files.filter(file => regex.test(file));
console.log(`There are ${stickers.length} stickers in the sticker pack`);
console.log("Going to convert");
const outputPath = (process.argv.length > 3) ? process.argv[3] : process.cwd();;
stickers.forEach(async sticker => {
    const im = await sharp(path.resolve(unzippedPath, sticker))
        .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer()
    const filePath = path.resolve(outputPath, `${path.parse(sticker).name}_512.png`);
    await sharp(im)
        .sharpen()
        .png()
        .toFile(filePath)
});


