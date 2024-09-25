const {DataTypes} = require ('sequelize');
const sequelize = require('../db/dbconnection');
const userprofile = require('./UserProfile')

const User = 
sequelize.define('User',{
    userId: {
        type: DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:UserProfile,
            key: 'userId'
        }
    
    }

},{
    tableName: 'users',
    timestamps:false
}

)
module.exports = User;
