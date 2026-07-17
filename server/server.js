const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection',(socket) =>{
   
    setTimeout(() => {
        socket.send('Hello');
    }, 3000);
     
   
})
