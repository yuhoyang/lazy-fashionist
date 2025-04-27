from flask import Flask, jsonify, request, render_template
import requests
import json
import os

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
    # file_data = {}
    print(json_data)

    if not json_data:
        return jsonify({"error": "No outfit data provided"}), 400

    # check if file exists
    if os.path.exists("outfits.json") and os.stat("outfits.json").st_size > 0:
        with open("outfits.json", "r+") as f:
            try:
                file_data = json.load(f)  # will read content and put f pointer to end

                id = file_data[-1].id + 1

                file_data.append(json_data)

                f.seek(0)
                json.dump(file_data, f, indent=4)  # save data into file
                f.truncate()
            except json.JSONDecodeError:  # if file is corrupt
                return jsonify({"error": "outfit.json is corrupted"}), 500

#        for key in data.keys():
    else:
        with open("outfits.json", "w") as f:
            json.dump([json_data], f, indent=4)

    return jsonify({"success": "outfit successfully set!"})


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


@app.route('/list_outfit', methods=['GET'])
def list_outfit():
    with open("outfits.txt", "r") as f:
        lines = f.read()
    return lines


@app.route('/weather', methods=['GET'])
def get_weather():
    # city = request.json.get("city")  # Get city name from AJAX request
    ajax = request.get_json()  # get json data from ajax request
    city = ajax.get('city')
    lat, lon = get_coordinates(city)

    if lat and lon:
        print(f"Latitude: {lat}, Longitude: {lon}")
    else:
        print(f"City {city} not found.")

    params = {  # define params for openmeteo query
            "latitude": lat,
            "longitude": lon,
            "start_date": "2025-04-10",
            "end_date": "2025-04-10",
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
