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
            validate: {
                len: {
                    args:[10,20],
                    msg: "Invalid length for email"
                },
                isEmail: {
                    msg: "Email not recognize"
                }
            }
        },

        password:{
            type:DataTypes.STRING,
            allowNull:false,
            validate: {
                len: {
                    args:[10,20],
                    msg: "Invalid length for email"
                },
                isEmail: {
                    msg: "Email not recognize"
                }
            }
        }
    

},{
    tableName: 'user',
    timestamps:false
}

)
module.exports = User;
