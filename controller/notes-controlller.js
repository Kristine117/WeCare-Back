const { exportDecryptedData, exportEncryptedData } = require('../auth/secure');
const Note = require('../model/Note')
const Appointment = require('../model/Appointment')

exports.createNote = async (req,res,next) => {
    const {noteContent ,appointmentId,isPinned, createdBy} = req.body;
    console.log(createdBy);
        const creator =  Number(await exportDecryptedData(createdBy.trim()));
        console.log(creator);
     try{
        const note = await Note.create({
            noteContent:noteContent,
            isPinned:isPinned,
            appointmentId:appointmentId,
           createdBy:creator
        })

        
         // Check if the note creation was successful
         if (note) {
            return res.status(200).json({ message: 'Note created successfully' });
        } else {
            return res.status(404).json({ message: 'Failed to create note' });
        }

    }catch(error){
        // next(error);

        console.error('Error while creating note:', error); // Log the error
        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message // Send the error message in the response for easier debugging
        });
    }


    
} 

exports.getALLNotes = async (req, res, next) => {
    const { userId } = req.params;  // Retrieve userId from params
    const creator =  Number(await exportDecryptedData(userId.trim())); // Ensure it's a number
    console.log(userId)
    console.log(creator);
    try {
        const retrievedNotes = await Note.findAll({
            where: {
                createdBy: creator, // Filter by createdBy
            },
            // include: [{
            //     model: Appointment,
            //     attributes: ['serviceDescription'],  // Include the serviceDescription from Appointment
            //     required: true, // Ensures that only notes with corresponding appointments are returned
            // }],
            order: [
                ['isPinned', 'DESC'], // First order by isPinned
                ['updatedAt', 'DESC']  // Then order by updatedAt
            ],
            
        });

        return res.status(200).send({
            isSuccess: true,
            message: "Successfully retrieved notes",
            notes: retrievedNotes  
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteNote = async (req,res,next) => {
    const {noteId} = req.body;
    
    try{
        const deleteMessage = await Note.destroy({
            where:{
                noteId:noteId
            }
        })

       // Check if a note was deleted
       if (deleteMessage === 0) {
        return res.status(404).send({
            isSuccess: false,
            message: "Note not found."
        });
     }

    // Respond with success if a note was deleted
    return res.status(200).send({
        isSuccess: true,
        message: "Note successfully deleted."
    });  


    }catch(error){
        next(error)
    }
}

exports.updateNote = async (req,res,next) => {
    const{noteId, isPinned} = req.body

    try {
      const result = await Note.update(
        {
          isPinned: isPinned,
        },

        {
          where: {
            noteId: noteId  // Update the note with the specific noteId
          }
        }
      );
      
      if(result[0] > 0 ){
        // Respond with success if a note was deleted
        return res.status(200).send({
            isSuccess: true,
            message: "Note successfully updated."
        })
      }

    } catch (error) {
      next(error);
    }
  };
  
