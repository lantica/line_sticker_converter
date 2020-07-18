import sharp from 'sharp';
import {promises as fs} from 'fs';
import path from 'path';
const regex = /^[0-9]{1,}@2x.png$/g;



(async function main(){
    if (process.argv.length < 3) throw new Error("No path is provided");
    const inputPath: string = process.argv[2];
    const outputPath: string = (process.argv.length > 3) ? process.argv[3] : process.argv[2]; 
    const files = await fs.readdir(inputPath);
    const stickers = files.filter(file => {return regex.test(file)});
    console.log(`There are ${stickers.length} stickers in the sticker pack`);
    console.log("Going to convert");
    stickers.forEach(async sticker => {
        const im = await sharp(`${inputPath}/${sticker}`).resize(512,512,{fit:'contain', background:{r:0,g:0,b:0,alpha:0}}).toBuffer().catch(console.error);
        //@ts-ignore
        await sharp(im).sharpen().png().toFile(`${outputPath}/${path.parse(sticker).name}_512.png`).catch(console.error);
    });
})().catch(console.error);
