const Experience = require("../model/Experience");
const addNewExperienceHandler=async(req,res,next)=>{

    try{
        const {numOfYears,experienceDescription } = req.body;
        await Experience.create({numOfYears,experienceDescription});

        res.status(200).send({
            isSuccess: true,
            message: "Successfully Registered Experience"
        })
    }catch(e){
        next(e);
    }
} 

const getAllExperience = async(req,res,next)=>{
    try{
        const experienceList = await Experience.findAll();

        res.status(200).send({
            isSuccess: true,
            message: "Successfully Retrieve Experince List",
            data: experienceList
        })
    }catch(e){
        next(e);
    }
}

module.exports = {
    addNewExperienceHandler,
getAllExperience}

