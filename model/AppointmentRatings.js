const {DataTypes} = require ('sequelize');
const sequelize = require('../db/dbconnection');
const Ratings = require('./Ratings')

const AppointmentRatings = 
sequelize.define('AppointmentRatings',{
    
    appointmentId: {
        type: DataTypes.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true  
    },

    ratingsId: {
        type: DataTypes.INTEGER,
        allowNull:false, 
        primaryKey:true,
        references:{
            model:Ratings,
            key:'ratingsId'
        }
    }
},{
    tableName: 'appointment_ratings',
    timestamps:false
}

)
module.exports = AppointmentRatings;