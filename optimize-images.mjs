import imagemin from "imagemin";
import imageminWebp from "imagemin-webp";
import imageminPngquant from "imagemin-pngquant";

(async () => {
    let fullImages = await convertFullImages();
    let previewImages = await convertPreviewImages();
    let jpgImages = await convertJpgImages();
    let total = fullImages.length + previewImages.length;
    console.log('Converted ' + jpgImages.length + ' jpg images to png format.');

    console.log('Converted ' + total + ' images to WEBP format.');
})();

function convertJpgImages(){
    return imagemin(['static/raw-images/*.{jpg,jpeg,JPG}'], {
        destination: 'static/png-images',
        plugins: [
            imageminPngquant()
        ]
    });
}

function convertFullImages(){
    return imagemin(['static/raw-images/*.{jpg,jpeg,JPG,png}'], {
        destination: 'static/images',
        plugins: [
            imageminWebp({quality: 85})
        ]
    });
}

function convertPreviewImages(){
    return imagemin(['static/raw-images/*.{jpg,jpeg,JPG,png}'], {
        destination: 'static/preview-images',
        plugins: [
            imageminWebp({
                resize: {
                    width: 600,
                    height: 340
                }
            })
        ]
    });
}