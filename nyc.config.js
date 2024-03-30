'use strict';

module.exports = {
  extends: '@istanbuljs/nyc-config-typescript',
  all: true,
  'check-coverage': true,
  include: [
    'src/**',
  ],
  exclude: [
    'src/__tests__',
    'src/index.ts',
    'src/types.ts',
  ],
  statements: 80,
  branches: 80,
  functions: 80,
  lines: 80,
};
