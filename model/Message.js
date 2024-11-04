const { DataTypes} = require('sequelize');
<<<<<<< HEAD
const sequelize = require('../db/dbconnection')
const User = require('./User')
=======

const sequelize = require('../db/dbconnection')
const User = require('./User')
const ChatRoom = require('./ChatRoom')
>>>>>>> 3b1b71f591c568801aa00341bd9973cae4ba9eea

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
<<<<<<< HEAD
        type:DataTypes.TEXT,
=======
        type:DataTypes.STRING,
>>>>>>> 3b1b71f591c568801aa00341bd9973cae4ba9eea
        allowNull:false
    },

   contentType:{
        type:DataTypes.TEXT,
        allowNull:false
    },

<<<<<<< HEAD
=======
    roomId: {
        type:DataTypes.UUID,
        allowNull:false,
        references:{
            model:ChatRoom,
            key: 'roomId'
        }
    },
>>>>>>> 3b1b71f591c568801aa00341bd9973cae4ba9eea

    date:{
        type:DataTypes.DATE,
        allowNull:false
    }
    ,

    time:{
        type:DataTypes.TIME,
        allowNull:false
<<<<<<< HEAD
    }

=======
    },
    readFlag: {
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:false
    }


>>>>>>> 3b1b71f591c568801aa00341bd9973cae4ba9eea
},{
    tableName: 'message',
    timestamps: false
})

module.exports =Message;