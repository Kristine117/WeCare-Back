const {DataTypes} = require ('sequelize');
const sequelize = require('../db/dbconnection')

const HealthStatus = sequelize.define('HealthStatus',{
    healthStatusId:{
        type:DataTypes.INTEGER,
        allowNull: false,
        primaryKey:true
    },
    healthStatus:{
        type:DataTypes.STRING,
        allowNull:false
    }

},{
    tableName: 'health_status',
    timestamps:false
})

module.exports = HealthStatus;