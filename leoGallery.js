import '/node_modules/lightgallery/lightgallery.umd.js';
import '/node_modules/lightgallery/plugins/fullscreen/lg-fullscreen.umd.js';
import '/node_modules/lightgallery/plugins/thumbnail/lg-thumbnail.umd.js';
import '/node_modules/lightgallery/plugins/autoplay/lg-autoplay.umd.js';
import '/node_modules/lightgallery/plugins/rotate/lg-rotate.umd.js';
import '/node_modules/lightgallery/plugins/zoom/lg-zoom.umd.js';
import '/node_modules/justifiedGallery/dist/js/jquery.justifiedGallery.min.js';
import images from '/images/images.json' assert { type: 'json' };

// Function for comparing images by date
function compareByDateTimeOriginal(a, b) {
  const parseDate = (dateString) => {
    if (!dateString) {
      return null; // Return null for items without DateTimeOriginal
    }
    const [datePart, timePart] = dateString.split(' ');
    const [year, month, day] = datePart.split(':');
    const [hours, minutes, seconds] = timePart.split(':');
    return new Date(year, month - 1, day, hours, minutes, seconds);
  };

  const dateTimeA = parseDate(a.exif.DateTimeOriginal);
  const dateTimeB = parseDate(b.exif.DateTimeOriginal);

  // Handle cases where one or both objects lack DateTimeOriginal
  if (dateTimeA === null && dateTimeB === null) {
    return 0; // Both items are considered equal
  }
  if (dateTimeA === null) {
    return 1; // Place items without DateTimeOriginal at the end
  }
  if (dateTimeB === null) {
    return -1; // Place items without DateTimeOriginal at the end
  }

  // Compare dates
  if (dateTimeA < dateTimeB) {
    return -1;
  }
  if (dateTimeA > dateTimeB) {
    return 1;
  }
  return 0;
}

function createImageTag(image) {
  const $imageTag = $('<a>', {
    href: `/images/${image.filename}`,
    html: $('<img>', {
      src: image.thumbnail,
      alt: image.exif.ImageDescription
    })
  });
  return $imageTag;
}

// Wait for the document to be ready, initialize LightGallery and JustifiedGallery
function initializeGallery() {
  // console.log('DOM is ready');
  
  const $galleryContainer = $('#leos-gallery');
  let imageArray = images.images;

  imageArray.sort(compareByDateTimeOriginal);
  // console.log(imageArray);

  for (const image of imageArray) {
    const $imageTag = createImageTag(image);
    $galleryContainer.append($imageTag);
  };

  // Initialize LightGallery with the dynamically created gallery items
  lightGallery($galleryContainer[0], {
    thumbnail: true,
    plugins: [lgZoom, lgThumbnail, lgAutoplay, lgFullscreen, lgRotate],
    licenseKey: 'your_license_key',
    speed: 500,
    // ... other settings
  });

  // Initialize justifiedGallery 
  $galleryContainer.justifiedGallery({
    waitThumbnailsLoad:	true,
    captions: false,
    lastRow: 'center',
    maxRowsCount: 0,
    maxRowHeight: 200,
    rowHeight: 200,
    border: 2,
    margins: 4
  }); 
}

$(initializeGallery);

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

// // Use the detect's results. passive applied if supported, capture will be false either way.
// $galleryContainer[0].addEventListener('touchstart', function() {}, supportsPassive ? { passive: true } : false);