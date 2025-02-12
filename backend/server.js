 
import { createServer } from 'node:http'; // node http library 
import { Server } from "socket.io";

const app = express();
const server = createServer(app); // how does this syntax work? why does it work like this? 
const io = new Server(server); // express = app, use that to create the http server, then pass it into io server? 
const port = 5000;

app.get('/api/data', (req, res) => {
    res.json({message: "this is the message from the server"})
});

server.listen(port, () => {
    console.log('server is running properly on port ${port}');
})
