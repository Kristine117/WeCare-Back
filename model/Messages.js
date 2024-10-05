const { DataTypes} = require('sequelize');
const sequelize = require('../db/dbconnection')
const User = require('./User')

const Message = sequelize.define('Message',{
    messageId:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },

    senderId:{

        type:DataTypes.INTEGER,
        allowNull:false,    
        references: {
            model: User,
            key : 'userId'
        }  
    },
    
    recipientId:{
        type:DataTypes.INTEGER,
        allowNull:false,   
        references: {
            model: User,
            key : 'userId'
        }
    },

    messageContent:{
        type:DataTypes.TEXT,
        allowNull:false
    },

   contentType:{
        type:DataTypes.TEXT,
        allowNull:false
    },


    date:{
        type:DataTypes.DATE,
        allowNull:false
    }
    ,

    time:{
        type:DataTypes.TIME,
        allowNull:false
    }

},{
    tableName: 'messages',
    timestamps: false
})

module.exports =Message;