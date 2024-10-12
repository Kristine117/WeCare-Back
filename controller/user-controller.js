const user = require("../model/User");
const userProfile = require("../model/UserProfile");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const auth = require("../auth/auth");
const sequelize = require("../db/dbconnection");
const senior = require("../model/Senior");
const { exportDecryptedData,exportEncryptedData } = require("../auth/secure");
const addNewUserHandler =async(req,res,next)=>{

    const t = await sequelize.transaction();
    try {
        const {lastname,firstname,
            email,userType, street,
            barangayId,
            contactNumber,gender,birthDate,
            experienceId,password,profileImage,
            seniorNumber, prescribeMeds, healthStatus,
            remarks} = req.body;
    
        const encryptedPassword = await bcrypt.hash(password,saltRounds)
            
        if(password?.length < 8 || password?.length > 26){
            res.status(400).send({
                isSuccess: false,
                message: "Error with Password Length"
            })
        }else {
            const result = await sequelize.transaction(async t=>{

                const newUserProfile = await 
            userProfile.create({lastname:lastname,
                firstname:firstname,email:email,userType:userType,
                street:street,barangayId:barangayId,contactNumber:contactNumber,
                gender:gender,birthDate:birthDate,experienceId:experienceId,
                profileImage:profileImage
                },
                { transaction: t });
    
            await user.create({
                userId: await newUserProfile.dataValues.userId,
                email:email,
                password:encryptedPassword
            },
            { transaction: t })


            if(userType == "senior"){
                await senior.create({
                    userId: await newUserProfile.dataValues.userId,
                    seniorNumber:seniorNumber,
                    prescribeMeds:prescribeMeds,
                    healthStatus:healthStatus,
                    remarks:remarks
                }, 
                { transaction: t })        
                return newUserProfile;
            } 

            return newUserProfile;
            })
            
            
            res.status(200).send({
                isSuccess: true,
                message:"Successfully Registered New User"
            })
        
        }
    }catch(e){
        
       next(e);
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
    
    res.status(201).send(
        {data: req.session.data}
    )
}

const getUserDataUsingAuthenticationToken = 
async(req,res,next)=>{
   try{

    const userInfo = await userProfile.findOne({
        where:{
            userId:req.user.userId
        }
    })
    const encryptedId = await exportEncryptedData(String(req.user.userId));

    if(!userInfo){

        return res.status(400).send({
            isSuccess: false,
            message: "Something went wrong!",
        })
    }

    delete userInfo?.dataValues.userId;


    res.status(200).send({
        isSuccess: true,
        message: "Successfully retrieve user's information",
        data: {
            userId: encryptedId,
            ...userInfo?.dataValues
        }
    })
   }catch(e){
    next(e)
   }
}
const updateUserHandlerForProfile = 
async(req,res,next)=> {
    const userId = req.user.userId;
    const {lastname,firstname,
        email,userType, street,
        barangayId,
        contactNumber,gender,birthDate,
        experienceId,password} = req.body;

        const encryptedPassword = await bcrypt.hash(password,saltRounds)
    try{
        const updateUserProfile = await userProfile.update(
            {firstname: firstname,
                lastname:lastname,
                email:email,
                userType:userType,
                barangayId:barangayId,
                contactNumber:contactNumber,
                gender:gender,
                birthDate:birthDate,
                experienceId:experienceId,
                password:encryptedPassword
            },
            {where: {
                userId:userId
            }}
        )
        
        res.status(200).send({
            isSuccess: true,
            message: "Hello there",
            data: updateUserProfile?.dataValues
        })   
    }catch(e){
        next(e);
    }
    
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
                data:{
                    token: token
                }
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

const retrieveListUserDetails = async(req,res,next)=>{

    try{
        const loggedinUser = await userProfile.findOne({
            where:{
                userId: req.user.userId
            }
        })

        const loggedinUserType = loggedinUser?.dataValues.userType;

        const userType = loggedinUserType === 'senior' ? 'assistant': 'senior';
        const userList = await userProfile.findAll({
            where: {
                userType: userType
            }
        })

        const newList = await userList.map(async(val)=>{
            val.dataValues['userId'] = await exportEncryptedData(String(val.dataValues.userId));
            return val.dataValues;
        });

        res.status(201).send({
            isSuccess:true,
            message: "Successfully retrieve users",
            data: await Promise.all(newList)
        })
    }catch(e){
        next(e)
    }
}

const processProfile = async (req,res,next)=>{
    try{
        console.log("Request")
        console.log(req.file);

        res.status(201).send({
            isSuccess: true,
            message: "Kwan mn ni"
        })
    }catch(e){
        next(e)
    }
}


module.exports = {
    addNewUserHandler,
    grabSession,
    saveUserRegistrationInSession,
    authenticationHandler,
    getUserDataUsingAuthenticationToken,
    updateUserHandlerForProfile,
    retrieveListUserDetails,
    processProfile
}