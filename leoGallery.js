import '/node_modules/lightgallery/lightgallery.umd.js';


// Wait for the document to be ready
$(document).ready(function () {
  // Get the "leos-gallery" container
  var $galleryContainer = $('#leos-gallery');
  console.log('dom ready');

  // Hardcoding relative image URLs based on the pattern Leo_xx.jpg 
  var imageArray = [];
  for (var i = 3; i <= 93; i++) {
    var imageNumber = i.toString().padStart(2, '0'); // Add leading zeros if needed
    var imageUrl = '/images/Leo_' + imageNumber + '.jpg';

    // Add image information to the array
    imageArray.push({
      src: imageUrl,
      thumb: imageUrl,
      subHtml: 'Image Caption ' + (i + 1)
    });

    // Create <a> tag with image
    var imageTag = $('<a href="' + imageUrl + '"><img src="' + imageUrl + '" alt="Image"></a>');
    // Append the image tag to the gallery container
    $galleryContainer.append(imageTag);
  }

  // Initialize LightGallery with the dynamically created gallery items
  lightGallery($galleryContainer[0], {
    thumbnail: true,
    plugins: [lgZoom, lgThumbnail],
    licenseKey: 'your_license_key',
    speed: 500,
    // ... other settings
  });
});

// // For when using a .json to keep a list of images in /images
// import images from './images.json'
// images.forEach(function(image) {
//     var imageUrl = image.url;

//     imageArray.push({
//         src: imageUrl,
//         thumb: imageUrl,
//         subHtml: 'Image Caption'
//     });

//     // Create <a> tag with image
//     var imageTag = $('<a href="' + imageUrl + '"><img src="' + imageUrl + '" alt="Image"></a>');
//     // Append the image tag to the gallery container
//     $galleryContainer.append(imageTag);
// });




// // Not using $.ajax because it conflicts with neocities CSP when fetching images (response type is blob, only img-src * data: allowed)

// // Wait for the document to be ready
// $(document).ready(function() {
//     // Get the "leos-gallery" container
//     var $galleryContainer = $('#leos-gallery');
//     console.log('dom ready')
//     // Dynamically fetch images from the "images" directory
//     $.ajax({
//         url: '/images', // Adjust the path accordingly
//         // type: 'GET',
//         // dataType: 'image',
//         success: function(data) {
//             console.log(data)
//             var imageArray = []
//             // Find all image files and create <a> tags for each
//             $(data).find("a:contains('.jpg')").each(function() {

//                 var imageUrl = $(this).attr('href');
//                 imageArray.push({
//                     src: imageUrl,
//                     thumb: imageUrl,
//                     subHtml: 'Image Caption'
//                 });

//                 // Create <a> tag with image
//                 var imageTag = $('<a href="' + imageUrl + '"><img src="' + imageUrl + '" alt="Image"></a>');
//                 // Append the image tag to the gallery container
//                 $galleryContainer.append(imageTag);
                
//             });
//             // console.log($galleryContainer[0]);
            
//             // Initialize LightGallery with the dynamically created gallery items
//             lightGallery($galleryContainer[0], {
//                 // dynamic: true,
//                 thumbnail: true,
//                 // dynamicEl: imageArray, // Use the array of gallery items
//                 plugins: [lgZoom, lgThumbnail],
//                 licenseKey: 'your_license_key',
//                 speed: 500,
//                 // ... other settings
//             });
//             console.log(imageArray);
//         }
//     error: function(jqXHR, textStatus, errorThrown) {
//         console.error('AJAX request failed:', textStatus, errorThrown);
//         // You can add more detailed error handling here, such as displaying an error message to the user.
//         }
//     });
// });