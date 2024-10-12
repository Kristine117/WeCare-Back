require('dotenv').config();
const cors = require('cors');
const express = require('express');
const http = require('http'); 
const socketIo = require('socket.io');
const path = require('path');
const multer = require('multer');

const app = express();
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { exportDecryptedData, exportEncryptedData } = require('./auth/secure');
const {sendMessage, uploadFiles} = require('./controller/chat-controller');

// Models
const UserProfile = require('./model/UserProfile');
const User = require('./model/User');
// DB connection
const sequelize = require('./db/dbconnection');

// Routes
const loginRoutes = require("./routes/login-routes");
const registerRoutes = require("./routes/register-routes");
const barangayRoutes = require("./routes/barangay-routes");
const experienceRoutes = require("./routes/experience-routes");
const userRoutes = require("./routes/user-routes");
const dashboardRoutes = require("./routes/dashboard-routes");
const setupMessageRoutes = require("./routes/message-routes"); 
const seniorRoutes = require("./routes/senior-routes");
const paymentRoutes = require("./routes/payment-routes");
// Port
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

// CORS Configuration
app.use(cors({
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST'],         
    credentials: true                
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/main", loginRoutes);
app.use("/main", registerRoutes);
app.use("/main", userRoutes);
app.use("/experience", experienceRoutes);
app.use("/barangay", barangayRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/senior",seniorRoutes);
app.use("/payment",paymentRoutes);
// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/download/:filename', (req, res) => {
    const file = path.join(__dirname, 'uploads', req.params.filename);
    res.download(file);  // This forces the browser to download the image
});

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

// Session creation
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


app.use((err,req,res,next)=>{
    console.log(err)
    if(err){
        res.status(500).send({
            isSuccess: false,
            message: err.message
        })

    }    
})



// Database connection and server start
async function startServer() {
    try {
        // Database connection
        await sequelize.authenticate();
        console.log('Database connected successfully!');

        // Table will be created if it does not exist yet.
        await sequelize.sync();

        // Set up message routes and pass the io instance
        app.use("/chat", setupMessageRoutes(io));

        server.listen(port, () => {
            console.log(`Server running at ${port}`);
        });
     
    } catch (error) {
        console.log(error);
    }
}


// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

   
    socket.on('joinRoom', ({ roomId, senderId }) => {
        // Join the client to the specified room
        socket.join(roomId);

        console.log(`${senderId} joined room: ${JSON.stringify(roomId)}`);
        console.log(roomId)

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

     // Listen for the 'sendMessage' event from the client
     socket.on('sendMessage', async (data) => {
        console.log("sendMessage is triggerred")
        // Call the sendMessage controller
        await sendMessage(data, io);  
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});




startServer();

