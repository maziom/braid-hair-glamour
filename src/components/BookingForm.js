import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BookingForm.css';

function BookingForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [bookedTimes, setBookedTimes] = useState([]);

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    if (!isWeekday(selectedDate)) {
      setMessage('Rezerwacja jest możliwa tylko od poniedziałku do piątku.');
      setDate('');
      setBookedTimes([]);
      setTime('');
    } else {
      setMessage('');
      setDate(selectedDate);
      axios.get(`https://braid-hair-glamour.onrender.com/api/bookings?date=${selectedDate}`)
        .then(response => {
          const bookedTimes = response.data.map(booking => booking.time);
          setBookedTimes(bookedTimes);

          if (bookedTimes.includes('09:00') && bookedTimes.includes('12:00')) {
            setTime('');
          } else if (!bookedTimes.includes('09:00')) {
            setTime('09:00');
          } else if (!bookedTimes.includes('12:00')) {
            setTime('12:00');
          }
        })
        .catch(error => {
          setMessage('Błąd podczas pobierania dostępnych godzin.');
          setBookedTimes([]);
          setTime('');
        });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post('https://braid-hair-glamour.onrender.com/api/book', { name, email, date, time })
      .then(response => {
        setMessage(response.data.message);
        setName('');
        setEmail('');
        setDate('');
        setTime('');
        setBookedTimes([]);
      })
      .catch(error => {
        setMessage('Błąd podczas rezerwacji. Spróbuj ponownie.');
      });
  };

  const isWeekday = (date) => {
    const day = new Date(date).getUTCDay();
    return day !== 0 && day !== 6; // 0: Sunday, 6: Saturday
  };

  return (
    <div className="BookingForm">
      <h2>Zarezerwuj wizytę</h2>
      <form onSubmit={handleSubmit}>
        <label>Imię</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required />

        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />

        <label>Data</label>
        <input type="date" value={date} onChange={handleDateChange} required />

        <label>Godzina</label>
        <select value={time} onChange={e => setTime(e.target.value)} disabled={!date || !time}>
          <option value="09:00" disabled={bookedTimes.includes('09:00')}>09:00</option>
          <option value="12:00" disabled={bookedTimes.includes('12:00')}>12:00</option>
        </select>

        <button type="submit" disabled={!time}>Zarezerwuj</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default BookingForm;
