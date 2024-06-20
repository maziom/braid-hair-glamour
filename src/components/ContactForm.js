import React, { useState } from 'react';
import axios from 'axios';
import './ContactForm.css';

function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post('https://braid-hair-glamour.onrender.com/api/message', { name, email, content })
      .then(response => {
        setMessage(response.data.message);
      })
      .catch(error => {
        setMessage(error.response.data.error);
      });
  };

  return (
    <div className="ContactForm">
      <h2>Skontaktuj się z nami</h2>
      <form onSubmit={handleSubmit}>
        <label>Imię</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required />

        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />

        <label>Wiadomość</label>
        <textarea value={content} onChange={e => setContent(e.target.value)} required />

        <button type="submit">Wyślij</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ContactForm;
