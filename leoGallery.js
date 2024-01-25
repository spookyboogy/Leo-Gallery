// Wait for the document to be ready
$(document).ready(function() {
    // Get the "leos-gallery" container
    var galleryContainer = $('#leos-gallery');
    console.log('dom ready')
    // Dynamically fetch images from the "images" directory
    $.ajax({
        url: 'images/', // Adjust the path accordingly
        success: function(data) {
            console.log(data)
            var imageArray = []
            // Find all image files and create <a> tags for each
            $(data).find("a:contains('.jpg')").each(function() {

                var imageUrl = $(this).attr('href');
                imageArray.push({
                    src: imageUrl,
                    thumb: imageUrl,
                    subHtml: 'Image Caption'
                });

                // Create <a> tag with image
                var imageTag = $('<a href="' + imageUrl + '"><img src="' + imageUrl + '" alt="Image"></a>');
                
                // Append the image tag to the gallery container
                galleryContainer.append(imageTag);
            
            });
        console.log(imageArray);
        }
    });
});