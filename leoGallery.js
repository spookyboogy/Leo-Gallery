import '/node_modules/lightgallery/lightgallery.umd.js';
import '/node_modules/lightgallery/plugins/fullscreen/lg-fullscreen.umd.js';
import '/node_modules/lightgallery/plugins/thumbnail/lg-thumbnail.umd.js';
import '/node_modules/lightgallery/plugins/autoplay/lg-autoplay.umd.js';
import '/node_modules/lightgallery/plugins/rotate/lg-rotate.umd.js';
import '/node_modules/lightgallery/plugins/zoom/lg-zoom.umd.js';
import '/node_modules/justifiedGallery/dist/js/jquery.justifiedGallery.min.js';
// import images from '/images/images.json' assert { type: 'json' }; 
// // this uses the es6 json module proposal which is supported by chrome but not by Safari and not on iOS devices 

var images = {}; // Declare images as a global variable

async function loadImages() {
  try {
    const response = await fetch('/images/images.json');
    if (!response.ok) {
      throw new Error('Failed to load images');
    }
    images = await response.json(); // Assign the loaded images to the global variable
    initializeGallery(); // Call initializeGallery after images are loaded
  } catch (error) {
    console.error('Error loading images:', error);
    // Handle the error appropriately
  }
}

loadImages();

var scrollPositions = {};

function openGallery(galleryName){

  var currentGalleryName = $('.gallery:visible').attr('id');
  var scrollTop = $(window).scrollTop();
  scrollPositions[currentGalleryName] = scrollTop;

  // implement gallery-specific scroll position saving
  $('.gallery').hide();
  $('#' + galleryName).show();
  
  // Restore the scroll position of the previously selected gallery if it exists
  if ( scrollPositions.hasOwnProperty(galleryName) ) {
    $(window).scrollTop(scrollPositions[galleryName]);
  } else { // Scroll to top
    $(window).scrollTop(0);
  }
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

function toggleButtonBackgrounds() {
  $('.tab').each(function(){
    const currentBackground = $(this).css('background-image');
    const newBackground = currentBackground === 'none' ? $(this).data('background-image') : 'none';
    $(this).css('background-image', newBackground);
  });
}

function createTabButton(imageDirectory){

  let _text;
  let backgroundImagePath;

  // hacky way of re-labeling the tab buttons
  // without sacrificing generalizability 
  if ( imageDirectory === 'phone-pictures' ) {
    _text = 'Digital Albums';
    backgroundImagePath = './images/' + imageDirectory + '/preview.png';
  } else if ( imageDirectory === 'purple-and-pink-albums' ) {
    _text = 'Photo Albums';
    backgroundImagePath = './images/' + imageDirectory + '/preview.png';
  } else {
    _text = imageDirectory;
    // check if a preview.png for backgroundImagePath exists in directory
    // set if exists otherwise do nothing
  }

  const $button = $('<button>', {
    class: 'tab',
    text: _text,
    css: {
      'background-image': `url(${backgroundImagePath})`
    },
    'data-background-image': `url(${backgroundImagePath})`, 
    click: function() {
      openGallery(imageDirectory);
    },
  });
  return $button;
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
  console.log(`Using default album : ${defaultAlbum}`);

  for (const [subdirectory, imageArr] of Object.entries(images)){
    console.log(`Image directory: ${subdirectory}`);
    console.log("\tImages :", imageArr);

    const $button = createTabButton(subdirectory);
    const $galleryDiv = createGalleryDiv(subdirectory, (subdirectory === defaultAlbum));

    if ( subdirectory === defaultAlbum ) {
      // add defaultAlbum stuff to front rather than back
      $('#tab-bar').prepend($button);
      $galleryContainer.prepend($galleryDiv);
    } else {
      $('#tab-bar').append($button);
      $galleryContainer.append($galleryDiv);
    }
    
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

  $(window).on("scroll", function() {

    const tabBarHeight = $('#tab-bar').outerHeight(); // Get the height of the tab bar
    var scrollTop = $(window).scrollTop();

    if (scrollTop > tabBarHeight ) { // might adjust later
      if (!$('#tab-bar').hasClass('sticky')) { 
        $('#tab-bar').addClass('sticky');
        toggleButtonBackgrounds();
      }
    } else {
      if ($('#tab-bar').hasClass('sticky')) { 
        $('#tab-bar').removeClass('sticky');
        toggleButtonBackgrounds();
      }
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