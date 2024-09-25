const {DataTypes} = require ('sequelize');
const sequelize = require('../db/dbconnection');
const experience = require("./Experience")

const UserProfile = 
sequelize.define('UserProfile',{

    userId: {
        type: DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,     
    },

    lastname :{
        type:DataTypes.STRING,
        allowNull : true,
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

    baranggayId:{
        type: DataTypes.INTEGER,
        allowNull : false,
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
          }

    }
},{
    tableName: 'userProfile',
    timestamps:false
}

)
module.exports = UserProfile;
