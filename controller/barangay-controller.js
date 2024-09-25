const { connection } = require("../db/dbconnection");


const addNewBarangayFuncHandler = async (data)=>{
    let isSuccessful = false;
    connection.query('Insert into `barangay` (`barangay`) values (?)',data,(err,result,fields)=>{
        isSuccessful =result.affectedRows > 0;
    })

    return {    
        isSuccessful
    }
}


module.exports = addNewBarangayFuncHandler;