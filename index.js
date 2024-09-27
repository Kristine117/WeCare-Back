require('dotenv').config();
const cors = require('cors')
const express = require('express');
const UserProfile = require('./model/UserProfile');
const User = require('./model/User');
const sequelize = require('./db/dbconnection')
const loginRoutes = require("./routes/login-routes");
const registerRoutes = require("./routes/register-routes");
const barangayRoutes = require("./routes/barangay-routes");
const experienceRoutes = require("./routes/experience-routes");
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

const port = process.env.PORT || 3000;

app.use("/main",loginRoutes);
app.use("/main",registerRoutes)
app.use("/main",barangayRoutes)
app.use("/main",experienceRoutes)

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

        app.listen(port,() =>{
            console.log(`Server running at  ${process.env.PORT}`);
        });
     
    }catch(error){
            console.log(error);
    }
}

startServer();