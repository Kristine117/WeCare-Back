const {DataTypes} = require ('sequelize');
const sequelize = require('../db/dbconnection');

const Payment = 
sequelize.define('Payment',{
    
    paymentId: {
        type: DataTypes.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true  
    },

    paymentMethod: {
        type: DataTypes.STRING,
        allowNull:false, 
    },

},{
    tableName: 'payment',
    timestamps:false
}

)
module.exports = Payment;
