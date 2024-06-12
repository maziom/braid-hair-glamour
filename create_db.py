from app import app, db
from models import Booking, Message

with app.app_context():
    db.create_all()
    print("Baza danych została utworzona.")
