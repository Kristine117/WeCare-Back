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
const nodemailer = require('nodemailer');

// Set up the transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,    // Sender email address (from environment variable)
        pass: process.env.EMAIL_PASSWORD // Email password or app-specific password
    },
    tls: {
        rejectUnauthorized: false        // Allow self-signed certificates
    }
});


// const addNewUserHandler = async (req, res, next) => {

//     const t = await sequelize.transaction();
//     try {
//       const {
//         lastname, firstname, email, userType, street,
//         barangayId, contactNumber, gender, birthDate,
//         numOfYears, experienceDescription, rate, password, seniorNumber, prescribeMeds, 
//         healthStatus, remarks, relationships
//       } = req.body;

//       const newExperience = null;

//       // Get the uploaded file
//       const profileImage = req.file ? `/profilePictures/${req.file.filename}` : null;

//       // Encrypt password
//       const encryptedPassword = await bcrypt.hash(password, saltRounds);
  
//       // Validate password length
//       if (password?.length < 8 || password?.length > 26) {
//         return res.status(400).send({
//           isSuccess: false,
//           message: "Error with Password Length"
//         });
//       }
  
//       // Main transaction block
//       const result = await sequelize.transaction(async (t) => {
//         if(numOfYears != null && 
//             experienceDescription != null
//         && rate != rate){
//             newExperience = await xperience.create({
//                 numOfYears:numOfYears,
//                 experienceDescription:experienceDescription,
//                 rate:rate
//             }, {transaction:t});    
//         } else {
//             newExperience = null;
//         }
        

//         // Create new user profile
//         const newUserProfile = await userProfile.create({
//           lastname: lastname,
//           firstname: firstname,
//           email: email,
//           userType: userType,
//           street: street,
//           barangayId: barangayId,
//           contactNumber: contactNumber,
//           gender: gender,
//           birthDate: birthDate,
//           experienceId: newExperience.dataValues.experienceId || null,
//           profileImage: profileImage // Save file path in profileImage
//         }, { transaction: t });
  
//         // Create user record
//         await user.create({
//           userId: newUserProfile.dataValues.userId,
//           email: email,
//           password: encryptedPassword
//         }, { transaction: t });
  
//         // If the user is a senior, create senior record and relationships if any
//         let newSenior = null;
//         if (userType === "senior") {
//           const newHealthStatus = await healthStatusModel.create({
//             healthStatus: healthStatus
//           }, { transaction: t });
  
//           // Create senior record
//           newSenior = await senior.create({
//             userId: newUserProfile.dataValues.userId,
//             seniorNumber: seniorNumber,
//             healthStatusId: newHealthStatus.dataValues.healthStatusId,
//             prescribeMeds: prescribeMeds,
//             remarks: remarks
//           }, { transaction: t });
  
//           // Handle relationships if provided
//           if (Array.isArray(relationships) && relationships.length > 0) {
//             const relationshipsWithSeniorId = relationships.map(rel => ({
//               ...rel,
//               seniorId: newSenior.dataValues.seniorId
//             }));
          
//             const sanitizedRelationships = relationshipsWithSeniorId.map(rel => ({
//               name: rel.name || null,
//               age: rel.age || null,
//               relationship: rel.relationship || null,
//               civilstatus: rel.civilstatus || null,
//               occupation: rel.occupation || null,
//               contactNumber: rel.contactNumber || null,
//               seniorId: newSenior.dataValues.seniorId
//             }));
          
//             await relationship.bulkCreate(sanitizedRelationships, { transaction: t, validate: true });
//           }
          
//         }
  
//         return newUserProfile;
//       });
  
//       res.status(200).send({
//         isSuccess: true,
//         message: "Successfully Registered New User"
//       });
  
//     } catch (e) {
//       await t.rollback();
//       next(e);
//     }
//   };
  
const addNewUserHandler = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
      const {
        lastname, firstname, email, userType, street,
        barangayId, contactNumber, gender, birthDate,
        numOfYears, experienceDescription, rate, password, seniorNumber, prescribeMeds, 
        healthStatus, remarks, relationships
      } = req.body;
  
      let newExperience = null;
  
      // Get the uploaded file
      const profileImage = req.file ? `/profilePictures/${req.file.filename}` : null;
  
      // Encrypt password
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
        // Only create the Experience record if all experience fields are provided
        if (numOfYears && experienceDescription && rate) {
          newExperience = await xperience.create({
            numOfYears: numOfYears,
            experienceDescription: experienceDescription,
            rate: rate
          }, { transaction: t });
        } else {
          // Set newExperience to null if any experience field is missing
          newExperience = null;
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
          experienceId: newExperience ? newExperience.dataValues.experienceId : null, // Set experienceId to null if no experience
          profileImage: profileImage // Save file path in profileImage
        }, { transaction: t });
  
        // Create user record
        await user.create({
          userId: newUserProfile.dataValues.userId,
          email: email,
          password: encryptedPassword
        }, { transaction: t });
  
        // Other logic for seniors, healthStatus, and relationships...
      });
  
      res.status(200).send({
        isSuccess: true,
        message: "Successfully Registered New User"
      });
  
    } catch (e) {
      await t.rollback();
      next(e);
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
                f.readFlag
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
                e.userType = :userType `,{
                    replacements:{loggedInUserId: userId,userType: userType},
                    type:QueryTypes.SELECT
                })

        const newList = await userList.map(async(val)=>{
          
            val['userId'] = await exportEncryptedData(String(val.userId));
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

// Function to send registration details via email
const retrievePasswordThruEmail = async (req, res, next) => {
    try {
        const { firstname, lastname, email } = req.body;

        // Define email options
        const mailOptions = {
            from: process.env.EMAIL_USER,  // Sender email
            to: process.env.EMAIL_USER,    // Receiver email (admin email)
            subject: `New User Registration - ${firstname} ${lastname}`,  // Email subject
            text: `A new user has registered with the following details:
                   Name: ${firstname} ${lastname}
                   Email: ${email}`  // Email content (plain text)
        };

        // Send email using transporter
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Error sending email:', err);
                return res.status(500).send({ isSuccess: false, message: 'Failed to send email.' });
            }
            console.log('Email sent: ' + info.response);
            res.status(200).send({ isSuccess: true, message: 'Email sent successfully!' });
        });

    } catch (error) {
        console.error('Error in email sending function:', error);
        next(error); // Pass the error to the next middleware
    }
};


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
    fetchAllEmails,
    retrievePasswordThruEmail
}