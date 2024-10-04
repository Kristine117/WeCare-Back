require('dotenv').config();
const cors = require('cors')
const express = require('express');

const sequelize = require('./db/dbconnection')
const loginRoutes = require("./routes/login-routes");
const registerRoutes = require("./routes/register-routes");
const barangayRoutes = require("./routes/barangay-routes");
const experienceRoutes = require("./routes/experience-routes");
const path = require('path');
const { loadMessages, sendMessage, uploadFiles } = require('./controller/socket-controller');


const app = express();
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const options = {
	host: process.env.HOST,
	port: 3306,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DB,
    checkExpirationInterval: 900000,
	expiration: 86400000
};

app.use(express.json());
app.use(express.urlencoded({extended: true}));
//app.use(cors());
// CORS Configuration
app.use(cors({
    origin: 'http://localhost:3000',  // Allow requests from your frontend
    methods: ['GET', 'POST'],         // Allow specific HTTP methods
    credentials: true                 // Allow cookies and authentication headers
}));

const port = process.env.PORT || 4000;

app.use("/main",loginRoutes);
app.use("/main",registerRoutes);
app.use("/main",barangayRoutes);
app.use("/main",experienceRoutes);
app.use("/main",userRoutes);
app.use("/dashboard",dashboardRoutes);

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.IO with CORS configuration
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000',  // Allow requests from your frontend
        methods: ['GET', 'POST'],
        credentials: true
    }
});


app.use((err,req,res,next)=>{
    if(err){
        res.status(500).send("Something went wrong")
    }  
})


//database connection and server start
async function startServer(){
    try{
        //database connevction
        await  sequelize.authenticate();
        console.log('Database connected successfully!')

        //table will be created if it does not exist yet.
        await sequelize.sync()

        server.listen(port,() =>{
            console.log(`Server running at  ${process.env.PORT}`);
        });
     
    }catch(error){
            console.log(error);
    }
}

startServer();

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log('A user connected');

    // Listen for a request to load existing messages
    socket.on('loadMessages', ({ senderId, recipientId }) => {
       const messages = loadMessages(socket, senderId, recipientId); // Call loadMessages with parameters
        socket.emit("loadedMessages", messages); // Emit the loaded messages to the client
        
    });

    // Handle new message event
    socket.on('sendMessage', (msg) => {
        sendMessage(msg, io);
    });

    // Handle file upload
    socket.on('uploadFiles', (file) => {
        console.log(file)
        uploadFiles(file, io);
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});