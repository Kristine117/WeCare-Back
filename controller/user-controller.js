const user = require("../model/User");
const userProfile = require("../model/UserProfile");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const auth = require("../auth/auth");
const sequelize = require("../db/dbconnection");
const senior = require("../model/Senior");
const { exportDecryptedData,exportEncryptedData } = require("../auth/secure");
const relationship = require("../model/Relationship");
const healthStatusModel = require("../model/HealthStatus");
const { QueryTypes } = require("sequelize");


const addNewUserHandler =async(req,res,next)=>{
    const t = await sequelize.transaction();
    try {
        const {
            lastname, firstname, email, userType, street,
            barangayId, contactNumber, gender, birthDate,
            experienceId, password, profileImage,
            seniorNumber, prescribeMeds, healthStatus,
            remarks, relationships
        } = req.body;

        // Encrypting password
        const encryptedPassword = await bcrypt.hash(password, saltRounds);

        // Validate password length
        if (password?.length < 8 || password?.length > 26) {
            return res.status(400).send({
                isSuccess: false,
                message: "Error with Password Length"
            });
        }

        // Main transaction block
        const result = await sequelize.transaction(async (t) => {

            // Create new user profile
            const newUserProfile = await userProfile.create({
                lastname: lastname,
                firstname: firstname,
                email: email,
                userType: userType,
                street: street,
                barangayId: barangayId,
                contactNumber: contactNumber,
                gender: gender,
                birthDate: birthDate,
                experienceId: experienceId || null,
                profileImage: profileImage
            }, { transaction: t });

            // Create user record
            await user.create({
                userId: newUserProfile.dataValues.userId,
                email: email,
                password: encryptedPassword
            }, { transaction: t });

            // If the user is a senior, create senior record and relationships if any
            let newSenior = null;
            if (userType === "senior") {
                newHealthStatus = await healthStatusModel.create({
                    healthStatus:healthStatus
                }, {transaction: t});


                // Create senior record
                newSenior = await senior.create({
                    userId: newUserProfile.dataValues.userId,
                    seniorNumber: seniorNumber,
                    healthStatusId: newHealthStatus.dataValues.healthStatusId,
                    prescribeMeds: prescribeMeds,
                    remarks: remarks
                }, { transaction: t });

               // Handle relationships if provided
                if (relationships && relationships.length > 0) {
                    const relationshipsWithSeniorId = relationships.map(rel => ({
                        ...rel,
                        seniorId: newSenior.dataValues.seniorId
                    }));

                    // Ensure empty fields are handled properly
                    const sanitizedRelationships = relationshipsWithSeniorId.map(rel => ({
                        name: rel.name || null,
                        age: rel.age || null,
                        relationship: rel.relationship || null,
                        civilstatus: rel.civilstatus || null,
                        occupation: rel.occupation || null,
                        contactNumber: rel.contactNumber || null,
                        seniorId: rel.seniorId
                    }));

                    // Bulk create relationships
                    await relationship.bulkCreate(sanitizedRelationships, { transaction: t, validate: true });
                }
            }

            return newUserProfile;
        });

        res.status(200).send({
            isSuccess: true,
            message: "Successfully Registered New User"
        });

    } catch (e) {
        await t.rollback();
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

const getAssistantDetails = async(req,res,next)=>{
    try{
        const {assistantId} = req.params;
        const assistantIdDec = await exportDecryptedData(assistantId);

        const results = await sequelize.query(
            'select userId, email, profileImage, concat_ws(" ",firstName,lastName) as fullName from UserProfile where userId = :userId ',{
                type: QueryTypes.SELECT,
                replacements: { userId: Number(assistantIdDec) },
            }   
        )

        const newResults = results.map(val=>{
            val["userId"] = assistantId;

            return val;
        })



        

        res.status(201).send({
            isSuccess: true,
            message: "Successfully retrieved Assistant Details",
            data:{...newResults[0]}
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
    processProfile,
    getAssistantDetails
}