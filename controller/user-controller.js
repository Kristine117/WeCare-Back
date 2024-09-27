const user = require("../model/User");
const userProfile = require("../model/UserProfile")
const bcrypt = require("bcrypt");
const saltRounds = 10;
const addNewUserHandler =async(req,res,next)=>{

    try {
        const {lastname,firstname,
            email,userType, street,
            barangayId,
            contactNumber,gender,birthDate,
            experienceId,password} = req.body;
    
        const encryptedPassword = await bcrypt.hash(password,saltRounds)
    
        const newUserProfile = await userProfile.create({lastname:lastname,
            firstname:firstname,email:email,userType:userType,
            street:street,barangayId:barangayId,contactNumber:contactNumber,
            gender:gender,birthDate:birthDate,experienceId:experienceId
        });

        const newUser = await user.create({
            userId: await newUserProfile.dataValues.userId,
            email:email,
            password:encryptedPassword
        })
    
        res.status(200).send({
            isSuccess: true,
            message:"It worked well"
        })
    }catch(e){
       next(e)
    }

}
const updateUserHandler = (data)=> {


}

module.exports = {
    addNewUserHandler,
    updateUserHandler
}