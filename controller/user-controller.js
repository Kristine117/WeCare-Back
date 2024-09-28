const user = require("../model/User");
const userProfile = require("../model/UserProfile")
const bcrypt = require("bcrypt");
const saltRounds = 10;
const auth = require("../auth/auth");
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

        req.session.data = null;
    }catch(e){
       next(e)
    }

}

const saveUserRegistrationInSession = (req,res,next)=>{
    const {lastname,firstname,
        email,userType, street,
        barangayId,
        contactNumber,gender,birthDate,
        experienceId,password} = req.body;

    req.session.data = {lastname,firstname,
        email,userType, street,
        barangayId,
        contactNumber,gender,birthDate,
        experienceId,password}

    req.session.save();
}

const grabSession = async(req,res,next)=>{
    console.log(req.session);

    res.status(201).send(
        {data: req.session.data}
    )
}
const updateUserHandler = (data)=> {


}

const authenticationHandler = async(req,res,next)=>{

    const {
        email,
        password
    } = req.body;
   
    try{
   
    const userAuthenticate = await user.findOne({
        where: {
            email: email
        }
    })

    if(userAuthenticate?.dataValues){
        const isPasswordMatches = await bcrypt.compare(password,userAuthenticate?.dataValues?.password);
     
        if(isPasswordMatches) {
            const token= await auth.createAccessToken(userAuthenticate?.dataValues);
            res.status(200).send({
                isSuccess: true,
                message: "Successfully Logged in",
                token: token
            })
        }else {
            res.status(201).send({
                isSuccess: false,
                message: "Invalid credentials"
            })
        }
    }else {
        res.status(200).send({
            isSuccess: false,
            message: "Credentials not recognize"
        })        
    }
    }catch(e){
        next(e)
    }
}

module.exports = {
    addNewUserHandler,
    updateUserHandler,
    grabSession,
    saveUserRegistrationInSession,
    authenticationHandler
}