from flask import Flask, jsonify, request, render_template
import requests
import json
import os
from datetime import datetime

app = Flask(__name__)

BASE_URL = "https://api.open-meteo.com/v1/forecast"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; rv:123.0) Gecko/20100101 Firefox/123.0"}  # Header to make sure servers respond properly


@app.route('/')
def home():
    return render_template("index.html")


@app.route('/goto_set_outfit')
def goto_set_outfit():
    return render_template("set_outfit.html")


@app.route('/goto_manage_outfits')
def goto_manage_outfits():
    return render_template("manage_outfits.html")


@app.route('/set_outfit', methods=['PUT'])
def set_outfit():
    json_data = request.get_json()
    print(json_data)

    if not json_data:
        return jsonify({"error": "No outfit data provided"}), 400

    # check if file exists
    if os.path.exists("outfits.json") and os.stat("outfits.json").st_size > 0:
        print("outfit.json exists")
        with open("outfits.json", "r+") as f:
            try:
                file_data = json.load(f)  # will read content and put f pointer to end
                last_key = get_available_key_num()
                print(f"available key = {last_key}")

                json_data = {last_key: json_data}
                add_tags(json_data)  # record tags in global.json and delete "tags" in json_data

                file_data.update(json_data)  # add json object to dict
                print(f"after update of dict: {file_data}")

                f.seek(0)
                json.dump(file_data, f, indent=4)  # save data into file
                f.truncate()
            except json.JSONDecodeError:  # if file is corrupt
                return jsonify({"error": "outfit.json is corrupted"}), 500
    else:
        print("outfit.json will be overwritten")
        with open("outfits.json", "w") as f:
            json_data = {0: json_data}  # set 0 as top-key of the received json object
            print(json_data)
            add_tags(json_data)  # record tags into global.json

            json.dump(json_data, f, indent=4)

    return jsonify({"success": "outfit successfully set!"})


# TODO: fix json handling
@app.route('/delete_outfit', methods=['DELETE'])
def delete_outfit():
    ajax = request.get_json()
    outfit_to_delete = ajax.get('outfit')

    if outfit_to_delete:
        print(f"outfit to delete: {outfit_to_delete}")
    else:
        print("error getting outfit to delete")

    with open("outfits.json", "r") as f:
        lines = f.read()

    with open("outfits.json", "w") as f:
        for line in lines:
            key = line.strip().split(';', 1)[0]  # strip the string beginning from ';'
            if key not in outfit_to_delete:  # matching outfit found
                f.write(line)


# TODO: update code with json format
@app.route('/list_outfit', methods=['GET'])
def list_outfit():
    with open("outfits.txt", "r") as f:
        lines = f.read()
    return lines


@app.route('/weather', methods=['GET'])
def get_weather():
    city = request.args.get('city')  # get query data from request
    # TODO: get also regional specification for more accurate weather forecast
    lat, lon = get_coordinates(city)

    if lat and lon:
        print(f"City: {city}, Latitude: {lat}, Longitude: {lon}")
    else:
        print(f"City {city} not found.")

    current_date = datetime.now().strftime('%Y-%m-%d')

    params = {  # define params for openmeteo query
            "latitude": lat,
            "longitude": lon,
            "start_date": current_date,
            "end_date": current_date,
            "hourly": "temperature_2m,windspeed_10m"
            }
    response = requests.get(BASE_URL, headers=HEADERS, params=params)
    if response.status_code != 200:
        print(f"Error getting response from open-meteo: {response.status_code}")
        return jsonify({"error": "City not found!"})

    data = response.json()

    return jsonify({  # respond with processed data
                    "temperature": data["hourly"]["temperature_2m"],
                    "windspeed": data["hourly"]["windspeed_10m"],
                    "time": data["hourly"]["time"]
                    })


# returns next assignable id number and increases global last key num
def get_available_key_num():
    with open("global.json", "r+") as f:
        data = json.load(f)
        data["last_key_num"] += 1

        f.seek(0)
        json.dump(data, f, indent=4)
        f.truncate()

        return data["last_key_num"]


# check if tag already exits if yes, append to map, if no, make new tag entry
# delete the "tag" key and its value from json_data afterwards
def add_tags(json_data):
    top_key = int(list(json_data.keys())[0])  # extract top-level key
    print(f"top key = {top_key}")

    if os.path.exists("global.json") and os.stat("global.json").st_size > 0:
        with open("global.json", "r+") as f:
            global_data = json.load(f)

            for data_key in json_data[top_key]["tags"]:
                matched_tag = False
                for global_key in global_data["tags"].keys():
                    # if tag already exists add current id in mentioned
                    if global_key == data_key:
                        global_data["tags"][global_key].append(top_key)
                        matched_tag = True

                # add new tag to the global file and add current id in mentioned
                if not matched_tag:
                    global_data["tags"][data_key] = [top_key]

            f.seek(0)
            json.dump(global_data, f, indent=4)
            f.truncate()

            del json_data[top_key]["tags"]
    else:
        print("Error: global.json is empty or corrupt")


# convert city to longitude and latitude coordinates for openmeteo
def get_coordinates(city):
    url = f"https://nominatim.openstreetmap.org/search?city={city}&format=json"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        data = response.json()
        lat = data[0]['lat']
        lon = data[0]['lon']
    else:
        print("Error getting response from openstreetmap")
        return None

    return lat, lon


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)
