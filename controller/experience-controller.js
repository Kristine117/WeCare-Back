const { connection } = require("../db/dbconnection");

const addNewExperienceHandler=(data)=>{
    let isSuccessful = false;
    connection.query('Insert into `experience` (`num_of_years`, `experience_description`) values (?)',[data,    ],(err,result,fields)=>{
        console.log(result)
    })
    return {
        isSuccessful
    }
} 

module.exports = {
    addNewExperienceHandler}

