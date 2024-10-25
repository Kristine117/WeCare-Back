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

   appointmentId:{
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

    readFlag: {
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:false
    },            

},{
    tableName: 'reminder',
    timestamps: false
})

module.exports = Reminder;