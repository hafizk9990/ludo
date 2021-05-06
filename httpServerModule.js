const http = require('http');
const myReadFile = require('./readFileModule');
const serverPort = 64000;

const server = http.createServer( async(req, res) => {
    if (req.url === '/') {
        console.log(`Request URL: localhost:${serverPort}${req.url}`);
        res.end(`Welcome to the Ludo Game`);
    }
    else if (req.url === '/myHTML') {
        console.log(`Request URL: localhost:${serverPort}/${req.url}`);
        const htmlFile = await myReadFile('./client.html')
        res.end(htmlFile);
    }
    else if (req.url === '/ludo.css') {
        console.log(`Request URL: localhost:${serverPort}/${req.url}`);
        const cssFile = await myReadFile('./ludo.css')
        res.end(cssFile);
    }
    else if (req.url === '/center.png' || req.url === '/favicon.ico') {
        console.log(`Request URL: localhost:${serverPort}/${req.url}`);
        const centerImage = await myReadFile('./center.png')
        res.end(centerImage);
    }
    else if (req.url === '/ClientJS') {
        console.log(`Request URL: localhost:${serverPort}/${req.url}`);
        const jsFile = await myReadFile('./client.js')
        res.end(jsFile);
    }
    else if (req.url === '/AppJS') {
        console.log(`Request URL: localhost:${serverPort}/${req.url}`);
        const jsFile = await myReadFile('./App.js')
        res.end(jsFile);
    }
    else if (req.url === '/GameJS') {
        console.log(`Request URL: localhost:${serverPort}/${req.url}`);
        const jsFile = await myReadFile('./Game.js')
        res.end(jsFile);
    }
    else if (req.url === '/LudoJS') {
        console.log(`Request URL: localhost:${serverPort}/${req.url}`);
        const jsFile = await myReadFile('./Ludo.js')
        res.end(jsFile);
    }
}).listen(serverPort);

module.exports = server;
