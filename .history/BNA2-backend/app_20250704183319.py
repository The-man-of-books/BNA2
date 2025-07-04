from flask import Flask, request, jsonify, render_template, redirect, url_for, session
from flask_cors import CORS
import json

app = Flask(__name__)
app.secret_key = 'your_super_secret_key'  # Add a secret key for session
CORS(app)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/admin-login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        pin = request.form.get('pin')
        if pin == '1234':
            session['logged_in'] = True  # Save login session
            return redirect(url_for('dashboard'))
        else:
            return "Incorrect PIN", 401
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    if not session.get('logged_in'):
        return redirect(url_for('admin_login'))  # Force login
    with open('cars.json') as f:
        cars = json.load(f)
    return render_template('dashboard.html', cars=cars)

@app.route('/add-car', methods=['POST'])
def add_car():
    if not session.get('logged_in'):
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.json
    with open('cars.json', 'r+') as file:
        cars = json.load(file)
        cars.append(data)
        file.seek(0)
        json.dump(cars, file, indent=2)
    return jsonify({'message': 'Car added successfully!'}), 200

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('home'))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
