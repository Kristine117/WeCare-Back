const { DataTypes} = require('sequelize');
const sequelize = require('../db/dbconnection')
const Note = require('./Note')


const Reminder = sequelize.define('Reminder',{
    reminderId:{
        type: DataTypes.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },

  noteId:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references: {
            model: Note,
            key : 'noteId'
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