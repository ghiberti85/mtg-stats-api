import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.e2e-spec.ts$', // ajuste conforme o padrão dos seus testes e2e
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverage: true,
  coverageDirectory: './coverage/e2e',
  coverageReporters: ['text', 'text-summary', 'lcov'],
  testEnvironment: 'node',
};

export default config;
