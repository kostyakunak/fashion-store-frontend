// Мок authService для тестов
export const authService = {
  login: jest.fn(() => Promise.resolve({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' })),
  register: jest.fn(() => Promise.resolve({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' })),
  logout: jest.fn(() => Promise.resolve()),
  getCurrentUser: jest.fn(() => Promise.resolve({
    firstName: 'Александр',
    lastName: 'Петров',
    email: 'alex.petrov@fashionstore.ru',
    phone: '+79161234567',
    address: 'ул. Тверская, д. 15, кв. 42, Москва, 125009'
  })),
  updateProfile: jest.fn(() => Promise.resolve({ success: true })),
  isAuthenticated: jest.fn(() => true),
  getToken: jest.fn(() => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c')
}; 