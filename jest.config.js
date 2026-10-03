module.exports = {
  preset: 'react-native',
  // apps/ holds the web apps (admin panel); they have their own test runner.
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/apps/'],
};
