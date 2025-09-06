require('../../../jest.polyfills');
// ...existing code...
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Register from '../register';

test('renders registration form fields', () => {
  render(<Register />, { wrapper: MemoryRouter });
  expect(screen.getByPlaceholderText(/Full Name/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Department/i)).toBeInTheDocument();
});

test('shows error when user already exists', async () => {
  render(<Register />, { wrapper: MemoryRouter });

  await userEvent.type(screen.getByPlaceholderText(/Full Name/i), 'Test User');
  await userEvent.type(screen.getByPlaceholderText(/Email/i), 'exists@test.com');
  await userEvent.type(screen.getByPlaceholderText(/Password/i), '123456');
  await userEvent.type(screen.getByPlaceholderText(/Department/i), 'IT');
  await userEvent.click(screen.getByRole('button', { name: /Register/i }));

  expect(await screen.findByText(/User already exists/i)).toBeInTheDocument();
});

test('registers successfully with new user', async () => {
  render(<Register />, { wrapper: MemoryRouter });

  await userEvent.type(screen.getByPlaceholderText(/Full Name/i), 'New User');
  await userEvent.type(screen.getByPlaceholderText(/Email/i), 'new@test.com');
  await userEvent.type(screen.getByPlaceholderText(/Password/i), '123456');
  await userEvent.type(screen.getByPlaceholderText(/Department/i), 'HR');
  await userEvent.click(screen.getByRole('button', { name: /Register/i }));

  expect(await screen.findByText(/Registration successful/i)).toBeInTheDocument();
});
