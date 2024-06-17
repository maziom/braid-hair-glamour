import os
from flask import Flask, request, jsonify, abort
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_mail import Mail
from email_validator import validate_email, EmailNotValidError
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user
import datetime

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgres://max:mSQMmFHbD7SaLWaPsQaQFRO65NL3YKAs@dpg-cpkv96nsc6pc73f5h0pg-a/braidhairglamour_postgresql')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    name = db.Column(db.String(150))

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String(10), nullable=False)
    time = db.Column(db.String(5), nullable=False)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    try:
        validate_email(email)
    except EmailNotValidError as e:
        return jsonify({"error": str(e)}), 400

    hashed_password = generate_password_hash(password, method='sha256')
    new_user = User(email=email, password=hashed_password, name=name)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid email or password"}), 401

    login_user(user)
    return jsonify({"message": "Logged in successfully"}), 200

@app.route('/api/logout', methods=['POST'])
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/api/check_auth', methods=['GET'])
def check_auth():
    if current_user.is_authenticated:
        return jsonify({"user": {"email": current_user.email, "name": current_user.name}}), 200
    else:
        return jsonify({"error": "User not authenticated"}), 401

def is_weekday(date_str):
    date = datetime.datetime.strptime(date_str, "%Y-%m-%d")
    return date.weekday() < 5

@app.route('/api/book', methods=['POST'])
def book():
    if not current_user.is_authenticated:
        return jsonify({"error": "User not authenticated"}), 401

    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    date = data.get('date')
    time = data.get('time')

    if not is_weekday(date):
        return jsonify({"error": "Rezerwacja jest możliwa tylko od poniedziałku do piątku."}), 400

    try:
        validate_email(email)
    except EmailNotValidError as e:
        return jsonify({"error": str(e)}), 400

    existing_booking = Booking.query.filter_by(date=date, time=time).first()
    if existing_booking:
        return jsonify({"error": "Termin już zarezerwowany."}), 400

    booking = Booking(name=name, email=email, date=date, time=time)
    db.session.add(booking)
    db.session.commit()

    return jsonify({"message": "Rezerwacja zakończona sukcesem!"}), 200

@app.route('/api/bookings', methods=['GET'])
def get_bookings():
    date = request.args.get('date')
    if date:
        bookings = Booking.query.filter_by(date=date).all()
    else:
        bookings = Booking.query.all()
    return jsonify([{
        'id': booking.id,
        'name': booking.name,
        'email': booking.email,
        'date': booking.date,
        'time': booking.time
    } for booking in bookings])

@app.route('/api/bookings/<int:id>', methods=['DELETE'])
def delete_booking(id):
    booking = Booking.query.get(id)
    if not booking:
        return jsonify({"error": "Rezerwacja nie znaleziona."}), 404

    db.session.delete(booking)
    db.session.commit()
    return jsonify({"message": "Rezerwacja anulowana."}), 200

@app.route('/api/bookings/<int:id>', methods=['PUT'])
def update_booking(id):
    data = request.get_json()
    booking = Booking.query.get(id)
    if not booking:
        return jsonify({"error": "Rezerwacja nie znaleziona."}), 404

    new_date = data.get('date', booking.date)
    new_time = data.get('time', booking.time)

    if not is_weekday(new_date):
        return jsonify({"error": "Rezerwacja jest możliwa tylko od poniedziałku do piątku."}), 400

    existing_booking = Booking.query.filter_by(date=new_date, time=new_time).first()
    if existing_booking and existing_booking.id != id:
        return jsonify({"error": "Termin już zarezerwowany."}), 400

    booking.date = new_date
    booking.time = new_time
    db.session.commit()
    return jsonify({"message": "Rezerwacja zaktualizowana."}), 200

@app.route('/api/message', methods=['POST'])
def send_message():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    content = data.get('content')

    try:
        validate_email(email)
    except EmailNotValidError as e:
        return jsonify({"error": str(e)}), 400

    message = Message(name=name, email=email, content=content)
    db.session.add(message)
    db.session.commit()

    return jsonify({"message": "Wiadomość wysłana!"}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
