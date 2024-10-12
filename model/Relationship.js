const { DataTypes } = require('sequelize');
const sequelize = require('../db/dbconnection');
const Senior = require('./Senior');

const Relationship = sequelize.define('Relationship', {
    relationShipId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    seniorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Senior,
            key: 'seniorId'
        }
    },
    name: {
        type: DataTypes.STRING,  // Correcting data type to STRING
        allowNull: false,
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    relationship: {
        type: DataTypes.STRING,
        allowNull: false
    },
    civilstatus: {
        type: DataTypes.STRING,
        allowNull: false
    },
    occupation: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contactNumber: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'relationship',
    timestamps: false
});

module.exports = Relationship;
