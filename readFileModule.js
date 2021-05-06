const fs = require('fs');

const myReadFile = (fileName) => {
    return new Promise( (resolve, reject) => {
        fs.readFile(fileName, 'utf-8', (error, data) => {
            if (error) {
                reject(error);
            }
            else {
                console.log(`File Found. Resolving ${fileName}`);
                resolve(data);
            }
        });
    });
}
module.exports = myReadFile;