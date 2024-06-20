import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BookingList.css';

function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [editBooking, setEditBooking] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    axios.get('https://braid-hair-glamour.onrender.com/api/bookings')
      .then(response => {
        setBookings(response.data);
      })
      .catch(error => {
        console.error('Błąd podczas pobierania rezerwacji', error);
      });
  };

  const handleDelete = (id) => {
    axios.delete(`https://braid-hair-glamour.onrender.com/api/bookings/${id}`)
      .then(response => {
        fetchBookings();
      })
      .catch(error => {
        console.error('Błąd podczas usuwania rezerwacji', error);
      });
  };

  const handleEdit = (booking) => {
    setEditBooking(booking);
    setNewDate(booking.date);
    setNewTime(booking.time);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    axios.put(`https://braid-hair-glamour.onrender.com/api/bookings/${editBooking.id}`, { date: newDate, time: newTime })
      .then(response => {
        setEditBooking(null);
        fetchBookings();
      })
      .catch(error => {
        console.error('Błąd podczas aktualizacji rezerwacji', error);
      });
  };

  const isWeekday = (date) => {
    const day = new Date(date).getUTCDay();
    return day !== 0 && day !== 6; 
  };

  return (
    <div className="BookingList">
      <h2>Lista rezerwacji</h2>
      <ul>
        {bookings.map(booking => (
          <li key={booking.id}>
            {editBooking && editBooking.id === booking.id ? (
              <form onSubmit={handleUpdate}>
                <label>Data</label>
                <input type="date" value={newDate} onChange={(e) => {
                  const selectedDate = e.target.value;
                  if (isWeekday(selectedDate)) {
                    setNewDate(selectedDate);
                  } else {
                    alert('Rezerwacja jest możliwa tylko od poniedziałku do piątku.');
                  }
                }} required />

                <label>Godzina</label>
                <select value={newTime} onChange={(e) => setNewTime(e.target.value)} required>
                  <option value="09:00" disabled={newTime !== "09:00" && bookings.some(b => b.date === newDate && b.time === "09:00")}>09:00</option>
                  <option value="12:00" disabled={newTime !== "12:00" && bookings.some(b => b.date === newDate && b.time === "12:00")}>12:00</option>
                </select>

                <button type="submit">Aktualizuj</button>
                <button type="button" onClick={() => setEditBooking(null)}>Anuluj</button>
              </form>
            ) : (
              <>
                <p>Imię: {booking.name}</p>
                <p>Email: {booking.email}</p>
                <p>Data: {booking.date}</p>
                <p>Godzina: {booking.time}</p>
                <button onClick={() => handleEdit(booking)}>Edytuj</button>
                <button onClick={() => handleDelete(booking.id)}>Usuń</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BookingList;
