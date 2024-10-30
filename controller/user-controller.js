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
const xperience = require("../model/Experience");
const { QueryTypes } = require("sequelize");


const addNewUserHandler = async (req, res, next) => {
    try {
    let {
        lastname, firstname, email, userType, street,
        barangayId, contactNumber, gender, birthDate,
        numOfYears, experienceDescription, rate, 
        password, seniorNumber, prescribeMeds, 
        healthStatus, remarks, relationships
    } = req.body;


    // Parse relationships if it's a string
    if (typeof relationships === 'string') {
        try {
        relationships = JSON.parse(relationships); // Parse the string into an array of objects
        } catch (error) {
        return res.status(400).send({
            isSuccess: false,
            message: "Invalid relationships data"
        });
        }
    }

    // Ensure relationships is always an array
    relationships = Array.isArray(relationships) ? relationships : [];
    let newExperience = null;

    // Encrypt password
    const encryptedPassword = await bcrypt.hash(password, saltRounds);

    // Validate password length
    if (password?.length < 8 || password?.length > 26) {
        return res.status(400).send({
        isSuccess: false,
        message: "Error with Password Length"
        });
    }

    // Handle profile image file if uploaded (assume using something like multer)
    let profileImagePath = null;
    if (req.file) {
        // profileImagePath = req.file.path; Save file path if uploaded
        profileImagePath = req.file.path.split('profilePictures')[1];
        //profileImagePath = path.relative(path.join(__dirname, '../profilePictures'), req.file.path);

    }

    // Main transaction block
    await sequelize.transaction(async (t) => {
        // Only create the Experience record if all experience fields are provided
        if (userType === "assistant") {
        newExperience = await xperience.create({
            numOfYears: numOfYears,
            experienceDescription: experienceDescription,
            rate: rate
        }, { transaction: t });
        }

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
        experienceId: newExperience ? newExperience.dataValues.experienceId : null, // Use null, not 0
        profileImage: profileImagePath || null, // Save file path or set to null
        approveFlg:false
        }, { transaction: t });

        // Create user record
        await user.create({
        userId: newUserProfile.dataValues.userId,
        email: email,
        password: encryptedPassword
        }, { transaction: t });

        // Other logic for seniors, healthStatus, and relationships...
        if (userType === "senior") {
        const newHealthStatus = await healthStatusModel.create({
            healthStatus: healthStatus
        }, { transaction: t });

        // Create senior record
        const newSenior = await senior.create({
            userId: newUserProfile.dataValues.userId,
            seniorNumber: seniorNumber || null,
            healthStatusId: newHealthStatus.dataValues.healthStatusId,
            prescribeMeds: prescribeMeds,
            remarks: remarks
        }, { transaction: t });

        // Handle relationships if provided
        if (Array.isArray(relationships) && relationships.length > 0) {
            const relationshipsWithSeniorId = relationships.map(rel => ({
            name: rel.name || null,
            age: rel.age || null,
            relationship: rel.relationship || null,
            civilstatus: rel.civilstatus || null,
            occupation: rel.occupation || null,
            contactNumber: rel.contactNumber || null,
            seniorId: newSenior.dataValues.seniorId
            }));

            await relationship.bulkCreate(relationshipsWithSeniorId, { transaction: t, validate: true });
        }
        }

        return newUserProfile;
    });

    res.status(200).send({
        isSuccess: true,
        message: "Successfully Registered New User"
    });

    } catch (e) {
    console.log(e);  // Log the error for debugging
    next(e);  // Pass the error to the next middleware (e.g., error handler)
    }
};

  
  

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


// const updateUserHandlerForProfile = async (req, res, next) => {
//     console.log(req.user.userId);
//     try {
//         let userId = req.user.userId;
//         let {
//             lastname, firstname, email, userType, street,
//             barangayId, contactNumber, gender, birthDate,
//             experienceId, password
//         } = req.body;
    
//         let profileImagePath = null;
//         if (req.file) {
//             //profileImagePath = req.file.path; //Save file path if uploaded
//             profileImagePath = req.file.path.split('profilePictures')[1];
//             //profileImagePath = path.relative(path.join(__dirname, '../profilePictures'), req.file.path);
//         }
    
//         let encryptedPassword = await bcrypt.hash(password, saltRounds);
    
//         let updateData = {
//             firstname,
//             lastname,
//             email,
//             userType,
//             barangayId,
//             contactNumber,
//             gender,
//             birthDate,
//             street,
//             profileImage: profileImagePath || null, // Save file path or set to null
//             experienceId: experienceId || null
//         };

//         let userDataAcc = {
//             email,
//             encryptedPassword
//         };

//         const updateUserProfile = await userProfile.update(updateData, {
//             where: { userId }
//         });

//         const updateUserAcc = await user.update(userDataAcc , {
//             where: { userId }
//         });

//         res.status(200).send({
//             isSuccess: true,
//             message: "User Data Updated",
//             data: updateUserProfile?.dataValues
//         });
//     } catch (e) {
//         next(e);
//     }
// };

const updateUserHandlerForProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
            lastname, firstname, email, userType, street,
            barangayId, contactNumber, gender, birthDate,
            experienceId, password
        } = req.body;

        let profileImagePath = null;
        if (req.file) {
            // Assume the static directory `profilePictures` is correctly set for serving images
            profileImagePath = req.file.path.split('profilePictures')[1];
        }

        // Encrypt the password only if it's provided
        let encryptedPassword;
        if (password) {
            encryptedPassword = await bcrypt.hash(password, saltRounds);
        }

        // Prepare data for userProfile update
        const updateData = {
            firstname,
            lastname,
            email,
            userType,
            barangayId,
            contactNumber,
            gender,
            birthDate,
            street,
            profileImage: profileImagePath || null,
            experienceId: experienceId || null
        };

        // Prepare data for user account update
        const userDataAcc = {
            email
        };
        if (encryptedPassword) {
            userDataAcc.password = encryptedPassword;
        }

        // Update userProfile data
        const updateUserProfile = await userProfile.update(updateData, {
            where: { userId }
        });

        // Update user account data if needed
        const updateUserAcc = await user.update(userDataAcc, {
            where: { userId }
        });

        res.status(200).send({
            isSuccess: true,
            message: "User Data Updated",
            data: updateUserProfile?.dataValues
        });
    } catch (e) {
        next(e);
    }
};


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

            const userProfileData = await userProfile.findOne({
                where:{
                    userId: userAuthenticate?.dataValues.userId
                }
            })
            const token= await auth.createAccessToken(userProfileData?.dataValues);
    
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
    const {userId} = req.user;
    try{
        const loggedinUser = await userProfile.findOne({
            where:{
                userId: userId
            }
        })

        const loggedinUserType = loggedinUser?.dataValues.userType;


        const userType = loggedinUserType === 'senior' ? 'assistant': 'senior';
        console.log("type:"+userType);
        console.log("userId:"+ userId);
        const userList = await sequelize.query(`
            SELECT 
                e.userId, 
                e.profileImage, 
                CONCAT_WS(" ", e.firstName, e.lastName) AS fullName,
                f.messageContent, 
                f.date, 
                f.date, 
                f.contentType,
                f.readFlag,
                f.contentType,
                f.senderId,
                f.messageId
            FROM 
                collabproj.userProfile e
            LEFT JOIN 
                (SELECT 
                    MAX(messageId) AS latestMessageId, 
                    CASE 
                        WHEN senderId = :loggedInUserId THEN recipientId 
                        ELSE senderId 
                    END AS otherUserId
                FROM 
                    collabproj.message
                WHERE 
                    senderId = :loggedInUserId OR recipientId = :loggedInUserId  
                GROUP BY 
                    otherUserId  
                ) AS latestMessage 
                ON e.userId = latestMessage.otherUserId  
            LEFT JOIN 
                collabproj.message f 
                ON f.messageId = latestMessage.latestMessageId 
            WHERE 
                e.userType = :userType
                ORDER BY 
            f.date DESC `,{
                    replacements:{loggedInUserId: userId,userType: userType},
                    type:QueryTypes.SELECT
                })

        const newList = await userList.map(async(val)=>{
          
            val['userId'] = await exportEncryptedData(String(val.userId));
            val['isFromLoggedInUser'] = Number(val.senderId) === Number(userId);
            return val;
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

        console.log(assistantIdDec)
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



// Function to fetch all user emails
async function fetchAllEmails(req, res, next) {
    try {
      // Use Sequelize's `findAll` method to get all user emails
      const users = await user.findAll({
        attributes: ['email'], // Select only the email field
      });
      
      // Map the results to extract only the emails
      const emails = users.map(user => user.email);
      
      // Send the emails as a response
      res.status(200).json(emails);
      
    } catch (error) {
        next(error); // Corrected error handling
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
    getAssistantDetails,
    fetchAllEmails
}