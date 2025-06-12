export default {
    getUniqueId: jest.fn(() => 'unique-id'),
    getManufacturer: jest.fn(() => Promise.resolve('Apple')),
    getBrand: jest.fn(() => 'iPhone'),
    getModel: jest.fn(() => 'iPhone 13'),
    // Add other functions you are using
  };