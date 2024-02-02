from PIL import Image
from datetime import datetime
import json
import os


input_path = './images/'
output_path = './images/.thumbnails/'
json_output_path = './images/images.json'

datetime_original_tag_id = 0x9003  # exif Tag ID for DateTimeOriginal, decimal: 36867
image_description_tag_id = 0x010e  # exif Tag ID for ImageDescription, decimal: 270

if not os.path.exists(output_path):
    os.makedirs(output_path)

for file_name in os.listdir(input_path):
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
            
            print('_' * 20 + '\n')
            print(f'Current image : {input_image_path}')
            # This is a temporary script for accessing improperly
            # saved manual metadata tags for date_taken done in GIMP, 
            # Proper DateTimeOriginal exif tags are written to the original 
            # if the GIMP keyword is found this overwrites the original keyword string, 
            # but the string is saved in the ImageDescription exif tag. 
            # If ImageDescription already exists, it's not overwritten.
            metadata = img.info
            date_taken = ""
            exif_data = img.getexif() or {}
            try:
                _keyword = metadata['photoshop'][1028].decode('utf-8')
                if "Date_taken" in _keyword or "date_taken" in _keyword:
                    date_taken = eval(_keyword.split("_taken")[1].split('"')[0].split()[1])
                else:
                    print(f'No date_taken value found in gimp metadata.')
            except:
                # print('\n\tNo metadata[photoshop] key or irregularly saved GIMP metadata tag')
                # No metadata[photoshop] key or irregularly saved GIMP metadata tag
                pass

            if date_taken:
                print("""Found manually added GIMP metadata keyword in format "Date_taken : '%m/%d/%y'" """)
                datetime_original = datetime.strptime(date_taken, "%m/%d/%Y").strftime("%Y:%m:%d 00:00:00")
                print(f"\tDate taken : {date_taken}")
                print(f"\tConverted  : {datetime_original}")
                
                if datetime_original_tag_id not in exif_data:
                    exif_data.update([(datetime_original_tag_id, datetime_original)])
                if image_description_tag_id not in exif_data:
                    exif_data.update([(image_description_tag_id, date_taken)])

            img.save(output_thumbnail_path, exif=exif_data)
            print(f'\nThumbnail created: {output_thumbnail_path}')

        if date_taken:
            # Add DateTimeOriginal exif tag to original image if it doesn't exist
            # Add ImageDescription exif tag with original/manual date string if it doesn't exist
            with Image.open(input_image_path) as img:
                exif_data = img.getexif() or {}
                # Only update and call img.save() on OG image if relevant tags don't already exist
                # The downside of editing exif data with PIL is that there is no way to preserve
                # the entire metadata of a file when saving 'in place'. This could possibly be overcome
                # by using temp copies or something but cba, this is written for very specific usage at the moment.
                overwriting_metadata = False
                if datetime_original_tag_id not in exif_data:
                    exif_data.update([(datetime_original_tag_id, datetime_original)])
                    overwriting_metadata = True
                if image_description_tag_id not in exif_data:
                    exif_data.update([(image_description_tag_id, date_taken)])
                    overwriting_metadata = True
                if overwriting_metadata:
                    img.save(input_image_path, exif=exif_data)
        
        print("\nChecking exif tags post processing.")
        # Check that exif tag saved correctly for both
        test_paths = [input_image_path, output_thumbnail_path]
        test_tags = [datetime_original_tag_id, image_description_tag_id]
        for test_path in test_paths:
            print(f'\t{test_path}')
            with Image.open(test_path) as img: 
                for tag in test_tags:
                    try: 
                        print(f'\t\ttag : {tag}:\n\t\t\t{img.getexif()[tag]}')
                    except:
                        print(f'\t\ttag : {tag}:\n\t\t\t Not found')
        print('_' * 20 )
        
# Create a list to store image entries to ./images/images.json
image_entries = []

for file_name in os.listdir(input_path):
    if file_name.lower().endswith('.jpg'):
        input_image_path = os.path.join(input_path, file_name)
        base_name, extension = os.path.splitext(file_name)
        output_thumbnail_name = f"{base_name}_small{extension}"
        output_thumbnail_path = os.path.join(output_path, output_thumbnail_name)

        with Image.open(input_image_path) as img:
            # Extract EXIF data
            exif_data = img.getexif() or {}
            datetime_original = exif_data.get(datetime_original_tag_id)
            image_description = exif_data.get(image_description_tag_id)

        # Create an image entry dictionary
        image_entry = {
            "filename": file_name,
            "thumbnail": output_thumbnail_path,
            "exif": {
                "DateTimeOriginal": datetime_original,
                "ImageDescription": image_description
            }
        }
        # Add the entry to the list
        image_entries.append(image_entry)

# Create a dictionary containing the list of image entries
image_data = {"images": image_entries}

# Save the dictionary as JSON
with open(json_output_path, 'w') as json_file:
    json.dump(image_data, json_file, indent=2)

print(f'images.json created at: {json_output_path}')


# # this is one way of viewing the GIMP keyword that I added manually with the format "Date_taken : '%M/%D/%Y'"
# # there is however no way (to my knowledge) to write non-exif metadata using Image.save(out.txt, exif=exif_data)
# 
# with Image.open(input_image_path) as img:
#     img.info
#     for i in img.metadata['photoshop']: print(i)
#     print(img.app['APP1'])
#
# # The other method, also unwriteable afaik 
# _keyword = img.info['photoshop'][1028].decode('utf-8')