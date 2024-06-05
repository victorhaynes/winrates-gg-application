import json
import boto3
import os
import requests
from dotenv import load_dotenv
import requests
from datetime import datetime


load_dotenv()

# Ex. Compare 14.11.1 to 14.5.1 and determine which patch is "larger" (i.e. most recent)
def compare_latest_version_to_last_saved_version(latest_version, last_saved_version):
    # Split the 2 patch versions into parts
    latest_parts = [int(part) for part in latest_version.split('.')]
    saved_parts = [int(part) for part in last_saved_version.split('.')]
    
    # Compare the chunks one by one
    for latest_part, saved_part in zip(latest_parts, saved_parts):
        if latest_part < saved_part:
            return False  # latest_version is less than last_saved_version
        elif latest_part > saved_part:
            return True   # latest_version is greater than last_saved_version
    
    # If all compared parts are equal, check if one version has more parts
    if len(latest_parts) <= len(saved_parts):
        return False # latest_version is less than or equal to last_saved_version
    else:
        return True   # latest_version is greater than last_saved_version


def get_and_upload_latest_item_icons():

    try:
        s3 = boto3.client(
            's3',
            region_name='us-east-2',
            aws_access_key_id=os.environ["AWS_IAM_ACCESS_KEY"],
            aws_secret_access_key=os.environ["AWS_IAM_SECRET_ACCESS_KEY"]
        )
        
        bucket = 'wr-gg-images-bucket'
        destination_folder = 'item_icons'
        patch_key = 'item_icons/latestPatch.json'

        # GET latest game version from Riot Data Dragon
        url = "https://ddragon.leagueoflegends.com/api/versions.json"
        response = requests.get(url)
        if response.status_code == 200:
            latest_version = response.json()[0]

            # GET last saved game version from S3            
            response = s3.get_object(Bucket=bucket, Key=patch_key)
            file_content = response['Body'].read().decode('utf-8')
            last_saved_game_version = json.loads(file_content)['version']

            # Compare Latest Version to Last Saved Version
            if compare_latest_version_to_last_saved_version(latest_version, last_saved_game_version):
                # Fetch (all) item(s).json from Riot Data Dragon
                url = f"https://ddragon.leagueoflegends.com/cdn/{latest_version}/data/en_US/item.json"
                response = requests.get(url)
                if response.status_code == 200:
                    all_items = response.json()["data"]
                    for item in all_items:
                        item_name = all_items[item]["name"]
                        item_icon_key = f"item_icons/{item}.png"
                        response = requests.get(f"https://ddragon.leagueoflegends.com/cdn/{latest_version}/img/item/{item}.png")
                        if response.status_code == 200:
                            item_icon_png = response.content
                            s3.put_object(Body=item_icon_png, Bucket=bucket, Key=item_icon_key)
                            print("Uploaded", item_icon_key, item_name, "to S3.")
                    s3.put_object(Bucket=bucket, Key=patch_key, Body=json.dumps({'version': latest_version}))
                    print("Updated item latest patch to:", latest_version)

            else:
                print("No item icons update performed", datetime.now())
        else:
            print("Error getting latest API version from Data Dragon.", datetime.now())

    except Exception as error:
        print(f"An error occured: {repr(error)}")

get_and_upload_latest_item_icons()