// Мок authService для тестов
export const authService = {
  login: jest.fn(() => Promise.resolve({ token: 'test-token' })),
  register: jest.fn(() => Promise.resolve({ token: 'test-token' })),
  logout: jest.fn(() => Promise.resolve()),
  getCurrentUser: jest.fn(() => Promise.resolve({
    firstName: 'Иван',
    lastName: 'Иванов',
    email: 'test@example.com',
    phone: '+79123456789',
    address: 'ул. Примерная, 123'
  })),
  updateProfile: jest.fn(() => Promise.resolve({ success: true })),
  isAuthenticated: jest.fn(() => true),
  getToken: jest.fn(() => 'test-token')
}; 