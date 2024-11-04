import imagemin from "imagemin";
import imageminWebp from "imagemin-webp";

(async () => {
    let fullImages = await convertFullImages();
    let previewImages = await convertPreviewImages();
    let total = fullImages.length + previewImages.length;
    console.log('Converted ' + total + ' images to WEBP format.');
})();

function convertFullImages(){
    return imagemin(['static/raw-images/*.{jpg,jpeg,png}'], {
        destination: 'static/images',
        plugins: [
            imageminWebp()
        ]
    });
}

function convertPreviewImages(){
    return imagemin(['static/raw-images/*.{jpg,jpeg,png}'], {
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