const { connection } = require("../db/dbconnection");

const addNewUserHandler =(data,data1)=>{

      
    // Insert into user_profile
    connection.query(
    'INSERT INTO `user_profile` (`lastname`, `firstname`, `email`, `user_type`, `street`, `barangay_id`, `contact_number`, `gender`, `birthdate`, `experience_id`) VALUES (?)',
    [data,],
    (err, result) => {
        if (err) {
        console.error('Error inserting into user_profile:', err);
        return;
        }

        if (result.affectedRows > 0) {

        let newRow = [result.insertId,...data1];
     

        connection.query('INSERT INTO `user` (`user_id`,`email`,`password`) VALUES (?)',[newRow,],(err2,result2)=>{
            console.log("is removal");
            console.log(result2);
            })
        } else {    
        
        connection.end();
        }
    }
    );

}
const updateUserHandler = (data)=> {


}

module.exports = {
    addNewUserHandler,
    updateUserHandler
}