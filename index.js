require('dotenv').config();
const cors = require('cors');
const express = require('express');
const http = require('http'); 
const socketIo = require('socket.io');
const path = require('path');
const multer = require('multer');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

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
app.use("/main", barangayRoutes);
app.use("/main", experienceRoutes);
app.use("/main", userRoutes);
app.use("/dashboard", dashboardRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

sessionStore.onReady().then(() => {
    console.log('MySQLStore ready');
}).catch(error => {
    console.error(error);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);  // Log the error
    res.status(500).send("Something went wrong");
});

// Database connection and server start
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully!');

        await sequelize.sync();

        app.use("/chat", setupMessageRoutes(io));

        server.listen(port, () => {
            console.log(`Server running at ${port}`);
        });
     
    } catch (error) {
        console.log(error);
    }
}

// Start the server
startServer();

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

