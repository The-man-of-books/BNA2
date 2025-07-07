from flask import Flask, request, jsonify, render_template, redirect, url_for, session, send_from_directory
from flask_cors import CORS
import json
import os
import time
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.secret_key = 'your_super_secret_key'
CORS(app)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Utility: Check allowed file types
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Utility: Load cars from JSON
def load_cars(file_path='cars.json'):
    if not os.path.exists(file_path):
        return []
    with open(file_path) as f:
        return json.load(f)

# Utility: Save cars to JSON
def save_cars(cars, file_path='cars.json'):
    with open(file_path, 'w') as f:
        json.dump(cars, f, indent=2)

# 🌐 Public Routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/cars')
def get_cars():
    return jsonify(load_cars())

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# 🔐 Admin Auth
@app.route('/admin-login', methods=['POST'])
def admin_login():
    pin = request.form.get('password')
    if pin == '1234567890/.,ManII':
        session['logged_in'] = True
        return jsonify({'success': True, 'message': 'Login successful.'}), 200
    return jsonify({'success': False, 'message': 'Incorrect password'}), 401

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('home'))

# 🛠 Admin Dashboard
@app.route('/dashboard')
def dashboard():
    if not session.get('logged_in'):
        return redirect(url_for('home'))
    cars = load_cars()
    return render_template('dashboard.html', cars=cars)

@app.route('/add_car', methods=['POST'])
def add_car():
    if not session.get('logged_in'):
        return jsonify({'error': 'Unauthorized'}), 403

    image_file = request.files.get('imageFile')
    if image_file and allowed_file(image_file.filename):
        filename = secure_filename(image_file.filename)
        timestamp = int(time.time())
        filename = f"{timestamp}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        image_file.save(filepath)
        image_url = f"/uploads/{filename}"
    else:
        return jsonify({'error': 'Image upload failed or invalid image.'}), 400

    new_car = {
        'year': request.form.get('year'),
        'make': request.form.get('make'),
        'description': request.form.get('description'),
        'price': request.form.get('price'),
        'image': image_url
    }

    cars = load_cars()
    cars.append(new_car)
    save_cars(cars)

    return redirect(url_for('dashboard'))

# 🏁 Run App
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')