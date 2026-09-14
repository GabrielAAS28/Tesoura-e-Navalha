const transpilar = [
  '@react-native[^/]*',
  'react-native[^/]*',
  '@react-navigation[^/]*',
  'nanoid',
  'use-latest-callback',
];
module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [`node_modules/(?!(?:${transpilar.join('|')})/)`],
  moduleNameMapper: {'^~/(.*)$': '<rootDir>/src/$1'},
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/styles/**'],
};
