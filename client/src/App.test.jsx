import { render, screen } from '@testing-library/react';
import App from './App';

test('renders connection heading', () => {
  render(<App />);
  const heading = screen.getByText(/CONNECT YOUR AI/i);
  expect(heading).toBeInTheDocument();
});