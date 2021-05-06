const httpServer = require('./httpServerModule');
const wssModule = require('./wssModule');
const serverPort = 64000;
const socketPort = 63000;

console.log(`NodeJS Server Running at Port ${serverPort} ...`);
console.log(`Socket Connection Established at Port ${socketPort} ...`);
console.log(`Please Go To: localhost:${serverPort}/myHTML to Start \n`);
