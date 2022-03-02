import sharp from "sharp";
import fs from "fs";
import { mkdir } from "fs/promises";
import path from "path";
import unzipper from "unzipper";
import axios from "axios";
import os from "os";
import { Transform } from "stream";

const nameRegex = /^[0-9]{1,}@2x.png$/g;

if (process.argv.length < 3) throw new Error("No path is provided");
const packId = process.argv[2];
if (!/^[0-9]{1,}/g.test(packId)) throw new Error("Invalid pack id");
const url = `https://stickershop.line-scdn.net/stickershop/v1/product/${packId}/iphone/stickers@2x.zip`;
const { data } = await axios({
    method: "get",
    url,
    responseType: "stream",
});

const outputPath = process.argv[3] ?? process.cwd();
await mkdir(path.resolve(outputPath), { recursive: true });

const stickerResizerFactory = () =>
    sharp()
        .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .sharpen()
        .png();

data.pipe(unzipper.Parse())
    .pipe(
        new Transform({
            objectMode: true,
            transform: (entry, e, cb) => {
                if (nameRegex.test(entry.path)) {
                    entry
                        .pipe(stickerResizerFactory())
                        .pipe(fs.createWriteStream(path.resolve(outputPath, `${path.parse(entry.path).name}_512.png`)))
                        .on("finish", cb);
                } else {
                    entry.autodrain();
                    cb();
                }
            },
        })
    )
    .on("error", (e) => console.error(e))
    .on("finish", () => console.log("Done!"));
