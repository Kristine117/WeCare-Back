const {DataTypes} = require ('sequelize');
const sequelize = require('../db/dbconnection');
const Appointment = require("../model/Appointment");
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
    appointmentId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: Appointment,
            key: 'appointmentId'
        }
    }

},{
    tableName: 'payment',
    timestamps:false
}

)
module.exports = Payment;
