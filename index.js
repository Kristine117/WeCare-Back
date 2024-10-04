require('dotenv').config();
const cors = require('cors')
const express = require('express');
<<<<<<< HEAD
const http = require('http'); 
const socketIo = require('socket.io');
const UserProfile = require('./model/UserProfile');
const User = require('./model/User');
const app = express();
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
=======

>>>>>>> f3829f7d4961de87d3e077bf9b5dc199bcc0fc05
const sequelize = require('./db/dbconnection')
const loginRoutes = require("./routes/login-routes");
const registerRoutes = require("./routes/register-routes");
const barangayRoutes = require("./routes/barangay-routes");
const experienceRoutes = require("./routes/experience-routes");
const userRoutes = require("./routes/user-routes");
<<<<<<< HEAD
const path = require('path');
const { loadMessages, sendMessage, uploadFiles } = require('./controller/socket-controller');


=======
const dashboardRoutes = require("./routes/dashboard-routes");
const app = express();
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
>>>>>>> f3829f7d4961de87d3e077bf9b5dc199bcc0fc05

const port = process.env.PORT || 4000;
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
<<<<<<< HEAD
// CORS Configuration
app.use(cors({
    origin: 'http://localhost:3000',  // Allow requests from your frontend
    methods: ['GET', 'POST'],         // Allow specific HTTP methods
    credentials: true                 // Allow cookies and authentication headers
}));


app.use("/main",loginRoutes);
app.use("/main",registerRoutes)
app.use("/main",barangayRoutes)
app.use("/main",experienceRoutes)
// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Message routes
app.use('/api/messages', messageRoutes);

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

=======
app.use(cors());

>>>>>>> f3829f7d4961de87d3e077bf9b5dc199bcc0fc05


//session creation
const sessionStore = new MySQLStore(options);

app.use(session({
	key: process.env.SESSION,
	secret: process.env.SESSION_SECRET,
	store: sessionStore,
	resave: false,
	saveUninitialized: false,
}));

// Optionally use onReady() to get a promise that resolves when store is ready.
sessionStore.onReady().then(() => {
	// MySQL session store ready for use.
	console.log('MySQLStore ready');
}).catch(error => {
	// Something went wrong.
	console.error(error);
});

<<<<<<< HEAD
=======
const port = process.env.PORT || 3000;

app.use("/main",loginRoutes);
app.use("/main",registerRoutes);
app.use("/main",barangayRoutes);
app.use("/main",experienceRoutes);
app.use("/main",userRoutes);
app.use("/dashboard",dashboardRoutes);

app.use((err,req,res,next)=>{
    if(err){
        res.status(500).send("Something went wrong")
    }  
})
>>>>>>> f3829f7d4961de87d3e077bf9b5dc199bcc0fc05


//database connection and server start
async function startServer(){
    try{
        //database connevction
        await  sequelize.authenticate();
        console.log('Database connected successfully!')

        //table will be created if it does not exist yet.
        await sequelize.sync()

        app.listen(port,() =>{
            console.log(`Server running at  ${process.env.PORT}`);
        });
     
    }catch(error){
            console.log(error);
    }
}

<<<<<<< HEAD
startServer();

// Socket.IO logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('sendMessage', (message) => {
        io.emit('receiveMessage', message); // Emit to all clients
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
=======
startServer();
>>>>>>> f3829f7d4961de87d3e077bf9b5dc199bcc0fc05
