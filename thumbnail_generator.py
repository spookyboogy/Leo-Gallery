from PIL import Image, ExifTags as tags
from datetime import datetime
import os

input_path = './images/'
output_path = './images/.thumbnails/'

if not os.path.exists(output_path):
    os.makedirs(output_path)

for file_name in os.listdir(input_path)[:1]:
    if file_name.lower().endswith('.jpg'):
        input_image_path = os.path.join(input_path, file_name)
        # Add suffix to the filename before the extension
        base_name, extension = os.path.splitext(file_name)
        output_thumbnail_name = f"{base_name}_small{extension}"
        output_thumbnail_path = os.path.join(output_path, output_thumbnail_name)

        with Image.open(input_image_path) as img:
            original_width, original_height = img.size
            max_thumbnail_height = 200  # Limit height to 200 pixels

            # Calculate dimensions to maintain aspect ratio
            aspect_ratio = original_width / original_height
            desired_height = min(original_height, max_thumbnail_height)
            desired_width = int(desired_height * aspect_ratio)

            # Resize the image
            img.thumbnail((desired_width, desired_height))
            
            # This is a temporary script for accessing improperly
            # saved manual metadata tags for date_taken done in GIMP, 
            # should rewrite images with proper DateTimeOriginal exif tags
            metadata = img.info
            date_taken = ""
            try:
                _keyword = metadata['photoshop'][1028].decode('utf-8')
                if "Date_taken" in _keyword or "date_taken" in _keyword:
                    date_taken = eval(_keyword.split("_taken")[1].split('"')[0].split()[1])
                else:
                    print(f'No date_taken value found for {input_image_path}')
            except:
                print('no photoshop key or irregularly saved metadata tag')

            if date_taken:
                datetime_original = datetime.strptime(date_taken, "%m/%d/%Y").strftime("%Y:%m:%d 00:00:00")
                print(f'Date taken : {date_taken}')
                print(f"Converted: {datetime_original}")
                
                # print(f'direct tag access: {img._getexif()[0x9003]}') # will fail if doesn't exist
                datetime_original_tag_id = 0x9003  # exif Tag ID for DateTimeOriginal, decimal: 36867
                # datetime_original_tag = datetime_original_tag_id.to_bytes(2, 'big') + b'\x00\x00'
                # print(f'datetime_original_tag : {datetime_original_tag}')
                # datetime_original_tag += len(datetime_original).to_bytes(2, 'big')
                # datetime_original_tag += datetime_original.encode('utf-8')
                # print(f'datetime_original_tag updated : {datetime_original_tag}')                

                exif_data = img.getexif() or {}
                
                if 36867 not in exif_data:
                    exif_data.update([(36867, datetime_original)])
                for i in exif_data.keys(): print(i)
                
            else:
                print(f'No date_taken metadata found for {input_image_path}')

            if date_taken and exif_data:
                # img.save(input_image_path, exif=exif_data)
                img.save(output_thumbnail_path, exif=exif_data)

        with Image.open(output_thumbnail_path) as thumb: 
            print(f'{output_thumbnail_path}\
                  \n\tDateTimeOriginal:\
                  \n\t\t{thumb.getexif()[0x9003]}')

        with Image.open(input_image_path) as img:
            exif_data = img.getexif() or {}
            if 36867 not in exif_data:
                if date_taken:
                    exif_data.update([(36867, datetime_original)])
            print(f"exif_data[36867] : {exif_data[36867]}")
            img.save(input_image_path, exif=exif_data)
        
        with Image.open(input_image_path) as img: 
            print(f'{input_image_path}\
                    \n\tDateTimeOriginal:\
                    \n\t\t{img.getexif()[0x9003]}')
            
        print(f'\n\nThumbnail created: {output_thumbnail_path}')


