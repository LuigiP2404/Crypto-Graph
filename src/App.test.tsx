import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the empty state prompting for a search', () => {
  render(<App />);
  const heading = screen.getByText(/search a cryptocurrency to get started/i);
  expect(heading).toBeInTheDocument();
});
