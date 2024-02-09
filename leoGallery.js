import '/node_modules/lightgallery/lightgallery.umd.js';
import '/node_modules/lightgallery/plugins/fullscreen/lg-fullscreen.umd.js';
import '/node_modules/lightgallery/plugins/thumbnail/lg-thumbnail.umd.js';
import '/node_modules/lightgallery/plugins/autoplay/lg-autoplay.umd.js';
import '/node_modules/lightgallery/plugins/rotate/lg-rotate.umd.js';
import '/node_modules/lightgallery/plugins/zoom/lg-zoom.umd.js';
import '/node_modules/justifiedGallery/dist/js/jquery.justifiedGallery.min.js';
import images from '/images/images.json' assert { type: 'json' };

function openGallery(galleryName){
  $('.gallery').hide()
  $('#' + galleryName).show()
}

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
    href: image.filePath,
    html: $('<img>', {
      src: image.thumbnail,
      alt: image.exif.ImageDescription
    })
  });
  return $imageTag;
}

function createTabButton(imageDirectory){

  let _text;
  // hacky way of re-labeling the tab buttons
  // without sacrificing generalizability 
  if ( imageDirectory === 'phone-pictures' ) {
    _text = 'Digital Albums';
  } else if ( imageDirectory === 'purple-and-pink-albums' ) {
    _text = 'Photo Albums';
  } else {
    _text = imageDirectory;
  }

  const $button = $('<button>', {
    class: 'tab',
    text: _text,
    click: function(){openGallery(imageDirectory)}
  });
  return $button 
}

function createGalleryDiv(imageDirectory, isVisible = false){

  const displayStyle = isVisible ? 'block' : 'none';
  const $galleryDiv = $('<div>', {
    id: imageDirectory,
    class: 'gallery tabcontent',
    style: `display: ${displayStyle};` // autohidden by default by .tabcontent css rule
  });
  return $galleryDiv;
}

// Wait for the document to be ready, initialize LightGallery and JustifiedGallery
function initializeGallery() {
  // console.log('DOM is ready');
  
  const $galleryContainer = $('#gallery-container');
  
  let defaultAlbum = "purple-and-pink-albums";
  defaultAlbum = defaultAlbum in images ? defaultAlbum : Object.keys(images)[0];
  
  console.log(`Unordered Directories: ${Object.keys(images)}`);
  console.log(`Using default album : ${defaultAlbum}`)

  for (const [subdirectory, imageArr] of Object.entries(images)){
    console.log(`Image directory: ${subdirectory}`);
    console.log("\tImages :", imageArr);

    const $button = createTabButton(subdirectory);
    $('#tab-bar').append($button);

    const $galleryDiv = createGalleryDiv(subdirectory, (subdirectory === defaultAlbum));
    $galleryContainer.append($galleryDiv);

    imageArr.sort(compareByDateTimeOriginal);

    for (const image of imageArr) {
      const $imageTag = createImageTag(image);
      $galleryDiv.append($imageTag);
    }

    // Create a LightGallery container for current gallery
    lightGallery($galleryDiv[0], {
      thumbnail: true,
      plugins: [lgZoom, lgThumbnail, lgAutoplay, lgFullscreen, lgRotate],
      licenseKey: "0000-0000-000-0000",
      speed: 500,
      // animateThumb: true,
      // zoomFromOrigin: true,  
      // toggleThumb: true,
      // ... other settings
    });
  }

  // Create justifiedGalleries for each gallery
  $('.gallery').justifiedGallery({
    waitThumbnailsLoad:	true,
    captions: false,
    lastRow: 'center',
    maxRowsCount: 0,
    maxRowHeight: 200,
    rowHeight: 200,
    border: 2,
    margins: 4
  }); 

  $(window).on("scroll", function(){

    const tabBarHeight = $('#tab-bar').outerHeight(); // Get the height of the tab bar
    var scrollTop = $(window).scrollTop();

    if (scrollTop > tabBarHeight ) { // Adjust this value according to your needs
        $('#tab-bar').addClass('sticky');
    } else {
        $('#tab-bar').removeClass('sticky');
    }

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