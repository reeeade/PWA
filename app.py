from flask import Flask, render_template, jsonify, request, send_from_directory, make_response
import json
import os

app = Flask(__name__)

DATA_FILE = "device_data.json"

@app.route("/")
def home():
    return render_template("index.html")

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

@app.route("/save-device-info", methods=["POST"])
def save_device_info():
    device_info = request.json
    if not device_info:
        return jsonify({"error": "Нет данных для сохранения"}), 400

    # Читаем существующие данные, если файл уже есть
    all_data = []
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as file:
            try:
                all_data = json.load(file)
            except json.JSONDecodeError:
                all_data = []

    # Добавляем данные в новый формат
    new_entry = {
        "id": len(all_data) + 1,
        "data": device_info  # Оставляем объект JSON вместо строки
    }
    all_data.append(new_entry)

    # Сохраняем данные обратно в файл
    try:
        with open(DATA_FILE, "w", encoding="utf-8") as file:
            json.dump(all_data, file, indent=4, ensure_ascii=False)
        return jsonify({"message": "Данные успешно сохранены"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
