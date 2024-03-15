# Leo's Gallery

A small JavaScript/jQuery project utilizing Light Gallery and Justified Gallery to showcase a gallery of cat photos.

## Todo:

<details>
<summary> Click to expand </summary>

- [x] Add other LightGallery plugins
- [x] Embed `date_photo_taken` metadata into images and incorporate it into HTML tagging
- [x] Implement retrieving image links/info from a `.json` file rather than hardcoding based on image filename pattern. (would have been possible to use neocities API but cba)
- [x] Create a script for building JSON from images in the `/images` directory (this is done inside thumbnail_generator.py now)
- [x] Design a stylish top bar with buttons that function as tab switchers between separate albums
- [x] Consider separating purple and pink albums (if appropriate), and add other photos after cleaning/prepping them (considered.. not doing for now)
- [ ] maybe implement media queries and srcset attributes or `<picture>` tags for serving smaller thumbnails to mobile devices. Currently, on mobile, the thumbnails are large enough that they usually get a whole row to themselves.  

build-related or script related 
- [x] Adapt `directory_resizer.py` to allow replacing/overwriting originals
- [ ] Adapt `directory_resizer.py` to possibly check if a directory is oversized and run itself if so
- [ ] Include the `directory_reiszer.py` script in build process
- [ ] Include the `thumbnail_generator` script in build process


neko-related
- [x] add oneko.js
- [ ] remake neko sprite file with other colors (orange is closest to leo)  
- [ ] add multiple instances of neko? 
- [ ] adapt neko to respond to touchstart on mobile?

misc/styling-related
- [ ] use non-pitch-black background color for galleries (final row too dark)
- [ ] improve responsive mobile design wrt decsription-box sizing and text display 
- [ ] switch album tab texts to " album 1 " " album 2 "
- [ ] change button and window shadows to blue or use a different polished style
- [ ] maybe use ⓘ or icon of ⓘ in "About" button 
- [ ] implement lazy loading, figure out why loading gets interrupted


non-site related
- [ ] update usb backup with rotated/data photoscans with appropriate naming convention

</details>

