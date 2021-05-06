const ws = new WebSocket(`ws://localhost:63000`);

ws.onopen = () => { console.log(`Socket Connection Opened`); }
ws.onclose = () => { console.log(`Socket Connection Closed`); }

const Game = () => {
    const [boardState, setBoardState] = React.useState([]);
    const [dice, setDice] = React.useState(-99);
    const [colorClass, setColorClass] = React.useState('');
    const [turn, setTurn] = React.useState('Player turn status will be displayed here during the game');
    const [win, setWin] = React.useState('Player victory status will be displayed here later on');

    ws.onmessage = (msg) => {
        let msgData = JSON.parse(msg.data);
    
        if (msgData.type === 'newboard') {
            let fullNewBoard = msgData.board;
            console.log('Board:', fullNewBoard);
            setBoardState(fullNewBoard);
        }
        else if (msgData.type === 'updatedBoard') {
            let updatedBoard = msgData.board;
            console.log('Updated Board:', updatedBoard);
            setBoardState(updatedBoard);
        }
        else if (msgData.type === 'dice') {
            let diceValue = msgData.value;
            setDice(diceValue);
        }
        else if (msgData.type === 'color') {
            let colorValue = msgData.hue;
            console.log(`Color Given to Me: ${colorValue}`);
            setColorClass('color'+ ' ' + colorValue);
        }
        else if (msgData.type === 'turn') {
            let turnColor = msgData.turnColor;
            console.log(`Whose Turn? ${turnColor}`);
            setTurn(`It's ${turnColor}'s turn`);
        }
        else if (msgData.type === 'turnBlocked') {
            let blockMsg = msgData.blockMsg;
            setTurn(`${blockMsg}`);
        }
        else if (msgData.type === 'win') {
            let winMsg = msgData.winMsg;
            setWin(`${winMsg}`);
        }
    }
    return(
        <React.Fragment>
            <h1 style = { {textAlign: 'center'} }> LET'S PLAY LUDO! </h1>
            <Ludo 
                incomingBoard = {boardState}
                thisColor = {colorClass}
            />
            <div style = { {marginTop: 670} }>
                <div className = 'dice'> {dice} </div>
                <div className = {colorClass}> </div>
                <div className = "text_box"> {turn} </div>
                <div className = "text_box"> {win} </div>
            </div>
        </React.Fragment>
    );
}
