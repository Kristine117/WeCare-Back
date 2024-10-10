const Barangay = require("../model/Barangay");

const addNewBarangayFuncHandler = async (req,res,next)=>{
    try{
        const {barangay } = req.body;
        await Barangay.create({barangay:barangay});

        res.status(200).send({
            isSuccess: true,
            message: "Successfully Registered Barangay"
        })
    }catch(e){
        next(e);
    }
}

const getAllBarangays = async (req,res,next)=>{
    try{
        const barangayList = await Barangay.findAll();

        res.status(200).send({
            isSuccess: true,
            message: "Successfully retrieve barangay list",
            data: barangayList
        })
    }catch(e){
        next(3)
    }
}


module.exports = {
    addNewBarangayFuncHandler,
    getAllBarangays
}