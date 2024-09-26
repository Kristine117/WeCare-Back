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
            allowNull:false
        },

        password:{
            type:DataTypes.STRING,
            allowNull:false
        }
    

},{
    tableName: 'user',
    timestamps:false
}

)
module.exports = User;
