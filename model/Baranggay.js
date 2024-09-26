const {DataTypes} = require ('sequelize');
const sequlize = require('../db/dbconnection')

const Baranggay = sequlize.define('Baranggay',{
    baranggayId: {
        type:DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true
        
    },
    baranggay:{
        type:DataTypes.STRING,
        allowNull:false
    }

},{
    tableName: 'baranggay',
    timestamps:false
})

module.exports= Baranggay;