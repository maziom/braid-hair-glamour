import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import BookingForm from './BookingForm';

jest.mock('axios');

describe('BookingForm', () => {
  test('renders BookingForm component', () => {
    render(<BookingForm />);
    expect(screen.getByText('Zarezerwuj wizytę')).toBeInTheDocument();
  });

  test('creates a new booking', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'Rezerwacja zakończona sukcesem!' } });
    
    render(<BookingForm />);

    fireEvent.change(screen.getByLabelText(/Imię/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@wp.pl' } });
    fireEvent.change(screen.getByLabelText(/Data/i), { target: { value: '2024-06-05' } });
    fireEvent.change(screen.getByLabelText(/Godzina/i), { target: { value: '09:00' } });

    fireEvent.click(screen.getByText('Zarezerwuj'));

    await waitFor(() => {
      expect(screen.getByText('Rezerwacja zakończona sukcesem!')).toBeInTheDocument();
    });
  });
});
