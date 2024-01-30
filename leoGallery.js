import '/node_modules/lightgallery/lightgallery.umd.js';
import '/node_modules/lightgallery/plugins/thumbnail/lg-thumbnail.umd.js';
import '/node_modules/lightgallery/plugins/zoom/lg-zoom.umd.js';
import '/node_modules/justifiedGallery/dist/js/jquery.justifiedGallery.min.js';

const $galleryContainer = $('#leos-gallery');

// $galleryContainer.justifiedGallery({
//     captions: false,
//     lastRow: "hide",
//     rowHeight: 180,
//     margins: 5
//   });

// Wait for the document to be ready
// $(document).ready(function () {
$(function() {
  console.log('dom ready');
  
  // Hardcoding relative image URLs based on the pattern Leo_xx.jpg 
  var imageArray = [];
  for (var i = 3; i <= 93; i++) {
    var imageNumber = i.toString().padStart(2, '0'); // Add leading zeros if needed
    var imageUrl = '/images/Leo_' + imageNumber + '.jpg';
    var thumbnailUrl = '/images/.thumbnails/Leo_' + imageNumber + '_small.jpg';

    // Add image information to the array
    imageArray.push({
      src: imageUrl,
      thumb: thumbnailUrl,
      subHtml: 'Image Caption ' + (i + 1)
    });

    // Create <a> tag with image
    var imageTag = $('<a href="' + imageUrl + '"><img src="' + thumbnailUrl + '" alt="Image"></a>');
    // Append the image tag to the gallery container
    $galleryContainer.append(imageTag);
  }

  
  // Initialize LightGallery with the dynamically created gallery items
  lightGallery($galleryContainer[0], {
    thumbnail: true,
    plugins: [lgZoom, lgThumbnail],
    licenseKey: 'your_license_key',
    speed: 500,
    // dynamic: true,
    // dynamicEl: imageArray,
    // ... other settings
  });
  // Initialize justifiedGallery 
  $galleryContainer.justifiedGallery({
    waitThumbnailsLoad:	true,
    captions: false,
    lastRow: 'center',
    maxRowsCount: 0,
    maxRowHeight: 200,
    border: 2,
    rowHeight: 200,
    margins: 5
  }); 
});


// Chrome gives the following warning
// leoGallery.js:32 (calling lightGallery) [Violation] Added non-passive 
// event listener to a scroll-blocking 'touchstart' event. Consider marking
// event handler as 'passive' to make the page more responsive. 
// See https://www.chromestatus.com/feature/5745543795965952
//
// Below is the solution when you have control over the Eventlisteners, but,
// because LightGallery is doing all the event handling, implementing this would mean
// rewriting/adjusting a ton of LightGallery code.
//  
// Test via a getter in the options object to see if the passive property is accessed
// var supportsPassive = false;
// try {
//   var opts = Object.defineProperty({}, 'passive', {
//     get: function() {
//       supportsPassive = true;
//     }
//   });
//   window.addEventListener("testPassive", null, opts);
//   window.removeEventListener("testPassive", null, opts);
// } catch (e) {}

// // Use our detect's results. passive applied if supported, capture will be false either way.
// $galleryContainer[0].addEventListener('touchstart', function() {}, supportsPassive ? { passive: true } : false);


// // For when using a .json to keep a list of images in /images
//
// import images from './images.json'
// images.forEach(function(image) {
//     var imageUrl = image.url;
//
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

