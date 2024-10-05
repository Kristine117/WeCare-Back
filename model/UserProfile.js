const {DataTypes} = require ('sequelize');
const sequelize = require('../db/dbconnection');
const experience = require("./Experience")
const barangay = require('./Barangay')

const UserProfile = 
sequelize.define('UserProfile',{

    userId: {
        type: DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,   
        autoIncrement: true  
    },

    lastname :{
        type:DataTypes.STRING,
        allowNull : true,
        validate: {
            len: {
                args: [2,10],
                msg: "Naay error"
            }
        }
    },

    firstname :{
        type:DataTypes.STRING,
        allowNull : false,

    },

    email:{
        type: DataTypes.STRING,
        allowNull : false,
        unique:true

    },

    userType:{
        type:DataTypes.STRING,
        allowNull : false,     
    },

    street:{
        type: DataTypes.TEXT,
        allowNull : false,
    },

    barangayId:{
        type: DataTypes.INTEGER,
        allowNull : false,
        references:{
            model:barangay,
            key:'barangayId'
        },
        defaultValue: 0
    },

    contactNumber:{
        type: DataTypes.STRING,
        allowNull : false,
    },
    gender:{
        type: DataTypes.STRING,
        allowNull : false,
    },

    birthDate:{
        type: DataTypes.DATE,
        allowNull : false,
    },

     experienceId : {
        type: DataTypes.INTEGER,
        allowNull:false,
        references: {
            model: experience, 
            key: 'experienceId' 
          },
          defaultValue:0

    }
},{
    tableName: 'user_profile',
    timestamps:false
}

)
module.exports = UserProfile;
