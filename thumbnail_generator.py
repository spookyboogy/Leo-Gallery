from PIL import Image, ExifTags
from datetime import datetime
import json
import os

datetime_original_tag_id = 0x9003  # exif Tag ID for DateTimeOriginal, decimal: 36867
image_description_tag_id = 0x010e  # exif Tag ID for ImageDescription, decimal: 270


def build_full_exif(img):
    """ Builds a full img.getexif() object from the older and more detailed img._getexif()"""

    full_exif_data = img._getexif() or {}
    exif_data = img.getexif()
    for k, v in full_exif_data.items():
        exif_data[k] = v
    return exif_data


def generate_thumbnails(input_path, output_path, max_height=200):

    if not os.path.exists(output_path):
        os.makedirs(output_path)

    for file_name in os.listdir(input_path):
        if file_name.lower().endswith('.jpg') or file_name.lower().endswith('.png'):
            input_image_path = os.path.join(input_path, file_name)
            # Add suffix to the filename before the extension
            base_name, extension = os.path.splitext(file_name)
            output_thumbnail_name = f"{base_name}_small{extension}"
            output_thumbnail_path = os.path.join(output_path, output_thumbnail_name)

            with Image.open(input_image_path) as img:
                original_width, original_height = img.size
                max_thumbnail_height = max_height  # Limit thumbnail size by height

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
                exif_data = build_full_exif(img)
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
                    print("""\tFound manually added GIMP metadata keyword in format "Date_taken : '%m/%d/%y'" """)
                    datetime_original = datetime.strptime(date_taken, "%m/%d/%Y").strftime("%Y:%m:%d 00:00:00")
                    print(f"\t\tDate taken : {date_taken}")
                    print(f"\t\tConverted  : {datetime_original}")
                    
                    if datetime_original_tag_id not in exif_data:
                        exif_data.update([(datetime_original_tag_id, datetime_original)])
                    if image_description_tag_id not in exif_data:
                        exif_data.update([(image_description_tag_id, date_taken)])

                img.save(output_thumbnail_path, quality=100, exif=exif_data)
                print(f'\nThumbnail created: {output_thumbnail_path}')

            if date_taken:
                # Add DateTimeOriginal exif tag to original image if it doesn't exist
                # Add ImageDescription exif tag with original/manual date string if it doesn't exist
                with Image.open(input_image_path) as img:
                    # Required to close and reopen img because previous block calls img.thumbnail()
                    exif_data = build_full_exif(img)
                    # Only update and call img.save() on OG image if relevant tags don't already exist
                    updating_original_exif = False
                    if datetime_original_tag_id not in exif_data:
                        exif_data[datetime_original_tag_id] = datetime_original
                        updating_original_exif = True
                    if image_description_tag_id not in exif_data:
                        exif_data[image_description_tag_id] = date_taken
                        updating_original_exif = True
                    if updating_original_exif:
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
                            print(f'\t\ttag : {tag}: {img.getexif()[tag]}')
                        except:
                            print(f'\t\ttag : {tag}: Not found')
            print('_' * 20 )
        print(f"End of {input_path}")


def generate_json(base_image_directory, image_folders):
    """implement If image_folders=none, find and include all viable folders"""

    print(f"\nBuilding images.json for {base_image_directory}...")
    # Create a list to store image entries to ./images/images.json
    # adapting this to handle multiple directories of images at once, structure of images.json will change 

    full_json = {}

    for image_folder in image_folders:
        image_entries = []
        thumbnail_folder_path = os.path.join(image_folder, '.thumbnails')
        for file_name in os.listdir(image_folder):
            if file_name.lower().endswith('.jpg') or file_name.lower().endswith('.png'):
                input_image_path = os.path.join(image_folder, file_name)
                base_name, extension = os.path.splitext(file_name)
                output_thumbnail_name = f"{base_name}_small{extension}"
                output_thumbnail_path = os.path.join(thumbnail_folder_path, output_thumbnail_name)

                with Image.open(input_image_path) as img:
                    # Extract EXIF data
                    exif_data = img._getexif() or {}
                    datetime_original = exif_data.get(datetime_original_tag_id)
                    image_description = exif_data.get(image_description_tag_id)
            
                if datetime_original and not image_description:
                    ymd = datetime_original.split()[0]
                    ymd = ymd.split(':')
                    image_description = '/'.join([ymd[1], ymd[2], ymd[0]])

                # Create an image entry dictionary
                image_entry = {
                    "filename": file_name,
                    "filePath": input_image_path,
                    "thumbnail": output_thumbnail_path,
                    "exif": {
                        "DateTimeOriginal": datetime_original,
                        "ImageDescription": image_description
                    }
                }
                # Add the entry to the list
                image_entries.append(image_entry)

        # Add the entries to the main json object
        image_folder_name_only = image_folder.split(os.path.sep)[-1]
        full_json[image_folder_name_only] = image_entries 

    json_output_path = os.path.join(base_image_directory, 'images.json') 
    # Save the dictionary as JSON
    with open(json_output_path, 'w') as json_file:
        json.dump(full_json, json_file, indent=2)

    print(f'images.json created at: {json_output_path}\n')


if __name__ == "__main__":

    root_image_directory = './images/'

    image_folders = []
    for i in os.listdir(root_image_directory):
        full_path = os.path.join(root_image_directory, i)
        if os.path.isdir(full_path):
            image_folders += [full_path]

    max_height = 200

    print(f"Base Directory : {root_image_directory}")
    for folder in image_folders:
        print('_' * 20 + '\n')
        print(f"Image directory: {folder}")

        output_path = folder + '/.thumbnails/'
        generate_thumbnails(folder, output_path, max_height=max_height)
        
        print('\n' + '_' * 20 + '\n')

    generate_json(root_image_directory, image_folders)


# # this is one way of viewing the GIMP keyword that I added manually with the format "Date_taken : '%M/%D/%Y'"
# # there is however no way (to my knowledge) to write non-exif metadata using Image.save(out.txt, exif=img.getexif())
# # 
# 
# with Image.open(input_image_path) as img:
#     metadata = img.info
#     for i in metadata['photoshop']: print(i)
#     print(img.app['APP1'])
#
# # The other method, also unwriteable afaik 
# _keyword = img.info['photoshop'][1028].decode('utf-8')