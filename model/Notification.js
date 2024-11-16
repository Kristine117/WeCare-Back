const {DataTypes} = require ('sequelize');
const sequelize = require('../db/dbconnection');
const Appointment = require("./Appointment");
const UserProfile = require("./UserProfile");
const Status = require("./Status");

const Notification = 
sequelize.define('Notification',{

    NotificationId: {
        type: DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement: true
    },

    appointmentId: {
        type: DataTypes.INTEGER,
        allowNull:false,
        references:{
            model: Appointment,
            key:'AppointmentId'
        }
    },

    seniorId: {
            type: DataTypes.INTEGER,
        allowNull:false,
        references:{
            model: UserProfile,
            key:'userId'
        }
    },
    assistantId: {
        type: DataTypes.INTEGER,
        allowNull:false,
        references:{
            model: UserProfile,
            key:'userId'
        }
    },
  
    statusId: {
        type: DataTypes.INTEGER,
        allowNull:false,
        references:{
            model: Status,
            key:'statusId'
        }
    },

    readFlag: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },

    isFromReminder: {
        type:DataTypes.BOOLEAN,
        allowNull:false
    }

},{
    tableName: 'notification',
    timestamps:true
}

)
module.exports = Notification;