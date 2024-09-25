require('dotenv').config();
const cors = require('cors')
const express = require('express');
const {connection} = require("./db/dbconnection")
const loginRoutes = require("./routes/login-routes");
const registerRoutes = require("./routes/register-routes");
const barangayRoutes = require("./routes/barangay-routes");
const experienceRoutes = require("./routes/experience-routes");
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());



connection.addListener('error', (err) => {
    console.log("error")
    console.log(err)
    if(!err){
        console.log("Connection successful")
    }
  });

app.use("/main",loginRoutes);
app.use("/main",registerRoutes)
app.use("/main",barangayRoutes)
app.use("/main",experienceRoutes)

app.use((err,req,res,next)=>{
    if(err){
        res.status(500).send("Something went wrong")
    }  
})

app.listen(3000,()=>{
    console.log(`Naminaw ni cya sa port 3000`)
});