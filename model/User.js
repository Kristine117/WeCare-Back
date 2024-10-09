const {DataTypes} = require ('sequelize');
const sequelize = require('../db/dbconnection');
const userprofile = require('./UserProfile')

const User = 
sequelize.define('User', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:userprofile,
            key: 'userId'
            },
        primaryKey:true

        },

        email:{
            type:DataTypes.STRING,
            allowNull:false,
            isLengthValid(value){
                if(value.length < 10 && value.length > 255){
                    throw new Error("Email length is invalid")
                }
            }
        },

        password:{
            type:DataTypes.STRING,
            allowNull:false,
            isLengthValid(value){
                if(value.length < 10 && value.length > 255){
                    throw new Error("Password length is invalid")
                }
            }

        }
    

},{
    tableName: 'user',
    timestamps:false
}

)
module.exports = User;
