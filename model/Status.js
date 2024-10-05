const {DataTypes} = require ('sequelize');
const sequlize = require('../db/dbconnection');

const Status =
sequelize.define('Status',{
    
    statusId: {
        type: DataTypes.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true,
     
    },
    statusDescription: {
        type: DataTypes.STRING,
        allowNull: true
    }
},{
    tableName: 'status',
    timestamps:false
}

)
module.exports = Status;