const Jimp = require('jimp');

async function removeBg() {
    console.log("Loading image...");
    const image = await Jimp.read('public/mobile-hero-girl.png');

    console.log("Removing black background...");
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
        const r = this.bitmap.data[idx];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];

        // threshold for black background (adjust if needed)
        if (r < 20 && g < 20 && b < 20) {
            this.bitmap.data[idx + 3] = 0; // set alpha to 0
        }
    });

    console.log("Saving image...");
    await image.writeAsync('public/mobile-hero-girl-trans.png');
    console.log("Done.");
}

removeBg().catch(console.error);
