const {DataTypes} = require ('sequelize');
const sequelize = require('../db/dbconnection');

const Experience = 
sequelize.define('Experience', {
    
    experienceId: {
        type: DataTypes.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true  
    },

    numOfYears: {
        type: DataTypes.INTEGER,
        allowNull:false, 
    },

    experienceDescription: {
        type: DataTypes.TEXT,
        allowNull:false, 
    },

},{
    tableName: 'experience',
    timestamps:false
}

)
module.exports = Experience;
