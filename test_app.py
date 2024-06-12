import pytest
from app import app, db, Booking, Message

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client
        with app.app_context():
            db.drop_all()

def test_book(client):
    response = client.post('/api/book', json={
        'name': 'John Doe',
        'email': 'john@wp.pl',
        'date': '2024-06-05',
        'time': '09:00'
    })
    assert response.status_code == 200, f"Unexpected status code: {response.status_code}, response data: {response.data}"
    assert response.get_json()['message'] == 'Rezerwacja zakończona sukcesem!'

def test_get_bookings(client):
    client.post('/api/book', json={
        'name': 'John Doe',
        'email': 'john@wp.pl',
        'date': '2024-06-05',
        'time': '09:00'
    })
    response = client.get('/api/bookings')
    assert response.status_code == 200, f"Unexpected status code: {response.status_code}, response data: {response.data}"
    bookings = response.get_json()
    assert len(bookings) == 1, f"Unexpected number of bookings: {len(bookings)}"
    assert bookings[0]['name'] == 'John Doe'

def test_delete_booking(client):
    client.post('/api/book', json={
        'name': 'John Doe',
        'email': 'john@wp.pl',
        'date': '2024-06-05',
        'time': '09:00'
    })
    booking_id = Booking.query.first().id
    response = client.delete(f'/api/bookings/{booking_id}')
    assert response.status_code == 200, f"Unexpected status code: {response.status_code}, response data: {response.data}"
    assert response.get_json()['message'] == 'Rezerwacja anulowana.'

def test_update_booking(client):
    client.post('/api/book', json={
        'name': 'John Doe',
        'email': 'john@wp.pl',
        'date': '2024-06-05',
        'time': '09:00'
    })
    booking_id = Booking.query.first().id
    response = client.put(f'/api/bookings/{booking_id}', json={
        'date': '2024-06-06',
        'time': '12:00'
    })
    assert response.status_code == 200, f"Unexpected status code: {response.status_code}, response data: {response.data}"
    assert response.get_json()['message'] == 'Rezerwacja zaktualizowana.'
    updated_booking = Booking.query.get(booking_id)
    assert updated_booking.date == '2024-06-06'
    assert updated_booking.time == '12:00'

def test_send_message(client):
    response = client.post('/api/message', json={
        'name': 'John Doe',
        'email': 'john@wp.pl',
        'content': 'This is a test message.'
    })
    assert response.status_code == 200, f"Unexpected status code: {response.status_code}, response data: {response.data}"
    assert response.get_json()['message'] == 'Wiadomość wysłana!'
