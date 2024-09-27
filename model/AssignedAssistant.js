const {DataTypes}= require('sequelize');
const sequelize = require('../db/dbconnection')
const userprofile = require('./UserProfile');


const Assistant = sequelize.define('AssingedAssistant',{
    userId:{

    },
    appointmentId:{
        
    }

},{
    tableName:'AssignedAssistant',
    timestamps:false
})