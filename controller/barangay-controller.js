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

const getSpecificBrangay = async (req, res, next) => {
    try {
        // Retrieve the ID from req.params
        const brgId = req.params.brgId;

        // Find the barangay by primary key
        const barangayResult = await Barangay.findByPk(brgId);

        if (!barangayResult) {
            return res.status(404).send({
                isSuccess: false,
                message: "Barangay not found"
            });
        }

        res.status(200).send({
            isSuccess: true,
            message: "Successfully retrieved barangay",
            data: barangayResult
        });
    } catch (e) {
        next(e);
    }
};


module.exports = {
    addNewBarangayFuncHandler,
    getAllBarangays,
    getSpecificBrangay
}