const ws = require('ws').Server;
const step = require('./stepFunction');
const fullNewBoard = require('./fullNewBoard');
const socketPort = 63000;
const wss = new ws({port: socketPort});

const iskilled = (ox, oy) => (ox-7)*(ox-7)+(oy-7)*(oy-7) == 98;

const killSprites = (copiedArray, color, x, y) => {
    console.log(`Kill Sprites Called ....`);
    for (let i = 0; i < copiedArray.length; i++) {
        if (copiedArray[i] !== color) {
            console.log('Colors not matched. Proceeding with killing');
            if (copiedArray[i] === 'blue') {
                fullNewBoard[0][0].push(copiedArray[i]);
            }
            else if (copiedArray[i] === 'green') {
                fullNewBoard[14][14].push(copiedArray[i]);
            }
            else if (copiedArray[i] === 'red') {
                fullNewBoard[0][14].push(copiedArray[i]);
            }
            else if (copiedArray[i] === 'yellow') {
                fullNewBoard[14][0].push(copiedArray[i]);
            }
        }
        else {
            console.log('Colors match. Cannot kill');
            fullNewBoard[x][y].push(copiedArray[i]);
        }
    }
}

let lastDiceValue = -99;
let totalPlayers = -1;
let colorsArray = ['blue', 'red', 'green', 'yellow'];
let turnCounter = 2;
let position = 1;
let sixOccurrance = 0;

let winningCells = {
    green: {
        row: 7, 
        col: 8
    }, 
    blue: {
        row: 7, 
        col: 6
    }, 
    red: {
        row: 6, 
        col: 7
    }, 
    yellow: {
        row: 8, 
        col: 7
    }
}

wss.on('connection', (client) => {
    console.log(`A client connected`);
    totalPlayers++;
    console.log(`Total Players: ${ totalPlayers + 1}`);
    
    if (totalPlayers === 3) { // starts from 0. Goes to 3 (total 4)
        let colorToSend = { 
            type: 'color', 
            hue: colorsArray[totalPlayers]
        }
        client.send(JSON.stringify(colorToSend));

        console.log(`4 players connected now. Sending board`);
        let boardToSend = {
            type: 'newboard', 
            board: fullNewBoard
        }
        
        turnCounter = (turnCounter + 1) % 4;
        let turnToSend = {
            type: 'turn',
            turnColor: colorsArray[turnCounter]
        }
        
        wss.clients.forEach( (eachClient) => {
            eachClient.send(JSON.stringify(boardToSend));
            eachClient.send(JSON.stringify(turnToSend));
        });

        wss.clients.forEach( (client) => {
            client.on('message', (msg) => {
                let parsedMsg = JSON.parse(msg);
                console.log(parsedMsg);
    
                if (parsedMsg.type === 'spriteClicked') {
                    console.log('Inside Sprite Clicked');
                    let color = parsedMsg.color;
                    let ox = parsedMsg.ox;
                    let oy = parsedMsg.oy;
    
                    if (color !== colorsArray[turnCounter]) {
                        console.log('Not this guys turn!. This guy is', color, 'and the turn belongs to', colorsArray[turnCounter]);
    
                        let turnToBlock = {
                            type: 'turnBlocked',
                            blockMsg: 'It is not your turn!'
                        }
                        client.send(JSON.stringify(turnToBlock));
                    }
                    else if (color === colorsArray[turnCounter]) {
                        let diceToSend = {
                            type: 'dice', 
                            value: Math.floor(Math.random() * 6) + 1
                        }
                        lastDiceValue = diceToSend.value;
                        console.log('Last Dice Value:', lastDiceValue);
        
                        wss.clients.forEach( (eachClient) => {
                            eachClient.send(JSON.stringify(diceToSend));
                        });
        
                        if (lastDiceValue !== 6) {
                            sixOccurrance = 0;
                            turnCounter = (turnCounter + 1) % 4;
                        }
                        if (sixOccurrance > 2) {
                            sixOccurrance = 0;
                            turnCounter = (turnCounter + 1) % 4;
                        }
                        let turnToSend = { // sending all of them the turn value
                            type: 'turn',
                            turnColor: colorsArray[turnCounter]
                        }
                
                        wss.clients.forEach( (eachClient) => {
                            eachClient.send(JSON.stringify(turnToSend));
                        });
        
                        let killedStatus = iskilled(ox, oy);
                        let newCoordinates = [];
            
                        if (killedStatus === true && lastDiceValue !== 6) {
                            console.log('Sprite is killed. 6 did not show up. Not calling step');
                        }
                        else {
                            if (killedStatus === true && lastDiceValue === 6) {
                                sixOccurrance++;
                                console.log('Sprite is killed. 6 showed up. Calling step with 1');
                                newCoordinates = step(color, ox, oy);
                            }
                            else if (killedStatus === false) {
                                if (lastDiceValue === 6) {
                                    sixOccurrance++;
                                }
                                console.log(`Sprite is not killed. ${ lastDiceValue } showed up. Calling step with ${ lastDiceValue }`);
                                newCoordinates = step(color, ox, oy, lastDiceValue); 
                            }
                            console.log('New Coordinates:', newCoordinates);
                            console.log('Contents at Old Coordinates:', fullNewBoard[ox][oy]);

                            let removedElement = fullNewBoard[ox][oy].splice(((fullNewBoard[ox][oy]).length - 1));
                            console.log('What We Have Removed from the Old Coordinates:', removedElement);
                            console.log('Updated Old Coordinates:', fullNewBoard[ox][oy]);
                            console.log('Contents at New Coordinates:', fullNewBoard[newCoordinates[0]][newCoordinates[1]]);
                            
                            if (fullNewBoard[newCoordinates[0]][newCoordinates[1]].length == 0) {
                                console.log('Empty. Cannot kill any');
                                fullNewBoard[newCoordinates[0]][newCoordinates[1]].push(removedElement[0]);
                            }
                            else {
                                console.log(`Not empty! Let's kill some!`);
                                let copiedArray = JSON.parse(JSON.stringify(fullNewBoard[newCoordinates[0]][newCoordinates[1]]));
                                fullNewBoard[newCoordinates[0]][newCoordinates[1]] = [];
                                fullNewBoard[newCoordinates[0]][newCoordinates[1]].push(removedElement[0]);
                                
                                killSprites(copiedArray, color, newCoordinates[0], newCoordinates[1]);
                            }
                            console.log('Updated Contents at New Coordinates:', fullNewBoard[newCoordinates[0]][newCoordinates[1]]);

                            if (fullNewBoard[winningCells.blue.row][winningCells.blue.col].length === 4) {
                                let winningMsg = {
                                    type: 'win',
                                    winMsg: `Congrats! Blue Finished and came in ${position} place`
                                }
                                wss.clients.forEach( (eachClient) => {
                                    eachClient.send(JSON.stringify(winningMsg));
                                });
                                fullNewBoard[winningCells.blue.row][winningCells.blue.col] = [] // Blue has already won! So, remove all of them from game
                                position++;
                            }
                            else if (fullNewBoard[winningCells.green.row][winningCells.green.col].length === 4) {
                                let winningMsg = {
                                    type: 'win',
                                    winMsg: `Congrats! Green Finished and came in ${position} place`
                                }
                                wss.clients.forEach( (eachClient) => {
                                    eachClient.send(JSON.stringify(winningMsg));
                                });
                                fullNewBoard[winningCells.green.row][winningCells.green.col] = [] // Green has already won! So, remove all of them from game
                                position++;
                            }
                            else if (fullNewBoard[winningCells.red.row][winningCells.red.col].length === 4) {
                                let winningMsg = {
                                    type: 'win',
                                    winMsg: `Congrats! Red Finished and came in ${position} place`
                                }
                                wss.clients.forEach( (eachClient) => {
                                    eachClient.send(JSON.stringify(winningMsg));
                                });
                                fullNewBoard[winningCells.red.row][winningCells.red.col] = [] // Red has already won! So, remove all of them from game
                                position++;
                            }
                            else if (fullNewBoard[winningCells.yellow.row][winningCells.yellow.col].length === 4) {
                                let winningMsg = {
                                    type: 'win',
                                    winMsg: `Congrats! Yellow Finished and came in ${position} place`
                                }
                                wss.clients.forEach( (eachClient) => {
                                    eachClient.send(JSON.stringify(winningMsg));
                                });
                                fullNewBoard[winningCells.yellow.row][winningCells.yellow.col] = [] // Yellow has already won! So, remove all of them from game
                                position++;
                            }

                            let updatedBoardToSend = {
                                type: 'updatedBoard', 
                                board: fullNewBoard
                            }
                            wss.clients.forEach( (eachClient) => {
                                eachClient.send(JSON.stringify(updatedBoardToSend));
                            });
                        }
                    }
                }
            });
        });
    }
    else {
        console.log(`Less than 4 players. Sending Color`);
        let colorToSend = {
            type: 'color', 
            hue: colorsArray[totalPlayers]
        }
        client.send(JSON.stringify(colorToSend));
    }
});
