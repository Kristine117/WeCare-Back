const { DataTypes} = require('sequelize');
const sequelize = require('../db/dbconnection')
const Appointment = require('./Appointment')


const Reminder = sequelize.define('Reminder',{
    reminderId:{
        type: DataTypes.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },

   AppointmentId:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references: {
            model: Appointment,
            key : 'appointmentId'
        } 
   },

   reminderDate:{
        type:DataTypes.DATE,
        allowNull:false
        }  
    ,
    
    reminderTime:{
        type:DataTypes.TIME,
        allowNull:false,   
        
    },
            
   

},{
    tableName: 'reminder',
    timestamps: false
})

module.exports = Reminder;