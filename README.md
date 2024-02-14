# Leo's Gallery

A small JavaScript/jQuery project utilizing Light Gallery and Justified Gallery to showcase a gallery of cat photos.

## Todo:

- [x] Add other LightGallery plugins
- [x] Embed `date_photo_taken` metadata into images and incorporate it into HTML tagging
- [x] Implement retrieving image links/info from a `.json` file rather than hardcoding based on image filename pattern. (would have been possible to use neocities API but cba)
- [x] Create a script for building JSON from images in the `/images` directory (this is done inside thumbnail_generator.py now)
- [ ] Adapt `directory_resizer.py` to allow replacing/overwriting originals
- [ ] Adapt `directory_resizer.py` to possibly check if a directory is oversized and run itself if so
- [ ] Include the `directory_reiszer.py` script in build process
- [ ] Include the `thumbnail_generator` script in build process
- [x] Design a stylish top bar with buttons that function as tab switchers between separate albums
- [x] Consider separating purple and pink albums (if appropriate), and add other photos after cleaning/prepping them (considered.. not doing for now)
- [ ] maybe implement media queries and srcset attributes or `<picture>` tags for serving smaller thumbnails to mobile devices. Currently, on mobile, the thumbnails are large enough that they usually get a whole row to themselves.  
- [ ] add oneko.js ? multiple instances? 
