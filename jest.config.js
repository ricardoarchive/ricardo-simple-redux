/* eslint no-param-reassign: ["error", { "props": false }] */

/**
 *  This function reads webpack aliases and convert them to Jest format
 *
 * Webpack aliases have the following format:
 * { '#server': path.resolve(__dirname, './src/server/') }
 *
 * Jest needs this format:
 * { '#server(.*)$': '<rootDir>/src/server/$1' }
 */
module.exports = {
  verbose: true,
  modulePathIgnorePatterns: ['build'],
  testMatch: ['**/?(*.)(__test).js'],
  collectCoverageFrom: ['src/**/*.js'],
}
