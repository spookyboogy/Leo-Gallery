from PIL import Image
import os

input_path = './images/'
output_path = './images/.thumbnails/'

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
            img.save(output_thumbnail_path)

        print(f'Thumbnail created: {output_thumbnail_path}')
