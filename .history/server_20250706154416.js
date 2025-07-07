from flask import Flask, request, jsonify, render_template_string, send_from_directory
from werkzeug.utils import secure_filename
import os
import json
import time

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.path.join('static', 'uploads')
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Utility: Check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# Utility: Load JSON data
def load_json(file_path):
    if not os.path.exists(file_path):
        return []
    with open(file_path, 'r') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

# Utility: Save JSON data
def save_json(file_path, data):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)

# 🔍 GET /cars — fetch cars from selected JSON file
@app.route('/cars')
def get_cars():
    file = request.args.get('file', 'cars.json')
    file_path = file if file in ['cars.json', 'cars-rep.json'] else 'cars.json'
    cars = load_json(file_path)
    return jsonify(cars)

# ➕ POST /add-car — add a new car with image upload
@app.route('/add-car', methods=['POST'])
def add_car():
    title = request.form.get('title')
    desc = request.form.get('desc')
    price = request.form.get('price')
    json_choice = request.form.get('jsonChoice')
    image_file = request.files.get('imageFile')

    if not all([title, desc, price, json_choice, image_file]):
        return '❌ Missing required fields or image.', 400

    if not allowed_file(image_file.filename):
        return '❌ Invalid image file type.', 400

    filename = secure_filename(image_file.filename)
    timestamp = int(time.time())
    filename = f"{timestamp}_{filename}"
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    image_file.save(image_path)

    image_url = f"/static/uploads/{filename}"
    new_car = { "title": title, "desc": desc, "price": price, "image": image_url }

    file_path = json_choice if json_choice in ['cars.json', 'cars-rep.json'] else 'cars.json'
    cars = load_json(file_path)
    cars.append(new_car)
    save_json(file_path, cars)

    return '✅ Car added successfully with image.'

# 🛠 GET /admin — HTML form for adding cars
@app.route('/admin')
def admin_form():
    return render_template_string("""
    <form action="/add-car" method="POST" enctype="multipart/form-data">
      <label for="title">Car Title:</label>
      <input type="text" id="title" name="title" required><br>

      <label for="desc">Car Description:</label>
      <textarea id="desc" name="desc" required></textarea><br>

      <label for="price">Car Price:</label>
      <input type="text" id="price" name="price" required><br>

      <label for="imageFile">Upload Image:</label>
      <input type="file" id="imageFile" name="imageFile" accept="image/*" required><br>

      <label for="json-choice">Choose JSON file:</label>
      <select id="json-choice" name="jsonChoice">
        <option value="cars-rep.json">cars-rep.json</option>
        <option value="cars.json">cars.json</option>
      </select><br><br>

      <button type="submit">Add Car</button>
    </form>
    """)

# 🖼 Serve uploaded images (optional if using /static/)
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# 🚀 Run the server
if __name__ == '__main__':
    app.run(debug=True, port=5000)