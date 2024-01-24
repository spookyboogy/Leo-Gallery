// leoGallery.js
function pushImagesToArray(imageDirectory) {
    var imageArray = [];

    // Fetch all .jpg files from the directory
    $.ajax({
        url: imageDirectory,
        success: function(data) {
            // console.log(`\n\ndata: \n${data}`);
            $(data).find('a[href$=".jpg"]').each(function() {
                var imagePath = imageDirectory + '/' + $(this).attr('href');
                imageArray.push({
                    src: imagePath,
                    thumb: imagePath,
                    subHtml: 'Image Caption'
                });
            });
            console.log(`imageArray : ${imageArray}`);
        }
    });

    // Return an empty array initially (it will be populated after the Ajax request completes)
    return imageArray;
}

function initializeLightGallery() {
    // Initialize LightGallery with the dynamically generated dynamicEl array
    var initialImageArray = pushImagesToArray('images');
    $('#leos-gallery').lightGallery({
        dynamic: true,
        thumbnail: true,
        selector: 'a',
        mode: 'lg-fade',
        dynamicEl: initialImageArray
    });
}


document.addEventListener('DOMContentLoaded', initializeLightGallery);
