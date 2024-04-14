const { randomUUID } = require('crypto');

console.log(randomUUID().replace(/-/g, ''));
