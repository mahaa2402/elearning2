require('../../../jest.polyfills');
// ...existing code...
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../login';
import { rest } from 'msw';
import { server } from '../../../mocks/server';

test('renders login form fields', () => {
  render(<Login />, { wrapper: MemoryRouter });
  expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
});

test('shows error for invalid credentials', async () => {
  const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

  render(<Login />, { wrapper: MemoryRouter });

  await userEvent.type(screen.getByLabelText(/Email/i), 'wrong@test.com');
  await userEvent.type(screen.getByLabelText(/Password/i), 'badpass');
  await userEvent.click(screen.getByRole('button', { name: /Login/i }));

  expect(alertMock).toHaveBeenCalledWith('Invalid credentials');
  alertMock.mockRestore();
});

test('logs in successfully with valid credentials', async () => {
  const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

  render(<Login />, { wrapper: MemoryRouter });
  await userEvent.type(screen.getByLabelText(/Email/i), 'admin@test.com');
  await userEvent.type(screen.getByLabelText(/Password/i), '123456');
  await userEvent.click(screen.getByRole('button', { name: /Login/i }));

  expect(alertMock).toHaveBeenCalledWith('Login successful!');
  alertMock.mockRestore();
});

test('fetches progress after login', async () => {
  const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

  render(<Login />, { wrapper: MemoryRouter });
  await userEvent.type(screen.getByLabelText(/Email/i), 'admin@test.com');
  await userEvent.type(screen.getByLabelText(/Password/i), '123456');
  await userEvent.click(screen.getByRole('button', { name: /Login/i }));

  // MSW progress mock should set currentLevel
  expect(localStorage.getItem('levelCleared')).toBe("2");

  alertMock.mockRestore();
});
