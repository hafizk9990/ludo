const Ludo = (props) => {
    let board = props.incomingBoard;
    let myColor = props.thisColor.substr(6);
    console.log(`My Color: ${myColor}`);
    const spriteClicked = (color, x, y) => {
        console.log('Some sprite clicked');
        let msgToSend = {
            type: 'spriteClicked', 
            color: color, 
            ox: x, 
            oy: y
        }
        if (myColor === color) {
            console.log('Sending to the Server ...');
            ws.send(JSON.stringify(msgToSend));
            console.log('Sent ...');
        }
        else {
            console.log(`Not sending message to the server because your color does not match with the sprite you clicked on ...`);
        }
    }
    return(
        <div>
        {
            board.map( (row, rowIndex) => {
                return(
                    <div> 
                        {
                            row.map( (col, colIndex) => {
                                return(
                                    <div className = {`cell${rowIndex}${colIndex}`}>  
                                        {
                                            col.map( (sprite) => {
                                                return(
                                                    <div onClick = { () => spriteClicked(sprite, rowIndex, colIndex) } className = {sprite}> </div>
                                                );
                                            })
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>    
                );
            })
        }
        </div>
    );
}
