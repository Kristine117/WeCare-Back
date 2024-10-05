const express = require('express');
const { Op } = require('sequelize');
const path = require('path');
const Message = require('../model/Message'); 
const upload = require('../config/multer');

const router = express.Router();

// Function to setup message routes that accepts the io instance
const setupMessageRoutes = (io) => {
    // Endpoint to retrieve messages by sender and recipient
    router.get('/', async (req, res) => {
        const { senderId, recipientId } = req.query;

        try {
            let messages;
            if (senderId && recipientId) {
                // Fetch messages from the database that match the sender and recipient
                messages = await Message.findAll({
                    where: {
                        [Op.or]: [
                            { senderId: senderId, recipientId: recipientId },
                            { senderId: recipientId, recipientId: senderId }
                        ]
                    },
                    order: [['date', 'ASC']], // Optional: Order by date
                });
            } else {
                // Fetch all messages if no filters are applied
                messages = await Message.findAll();
            }

            return res.json(messages);
        } catch (error) {
            console.error('Error retrieving messages:', error);
            return res.status(500).json({ error: 'Error retrieving messages' });
        }
    });

    // Endpoint to send a message via REST and emit it via Socket.IO
    router.post('/', async (req, res) => {
        const { senderId, recipientId, messageContent, contentType } = req.body;

        try {
            // Create a new message instance in the database
            const currentDate = new Date();
            const date = currentDate; 
            const time = currentDate.toTimeString().split(' ')[0]; // Format as HH:MM:SS
            const message = await Message.create({
                senderId,
                recipientId,
                messageContent,
                contentType,
                date,
                time
            });

            io.emit('receiveMessage', message); // Emit the message to all connected clients
            return res.json(message);
        } catch (error) {
            console.error('Error sending message:', error);
            return res.status(500).json({ error: 'Error sending message' });
        }
    });

   
 // Endpoint for file uploads
router.post('/upload', upload.array('files'), async (req, res) => { 
    if (req.files && req.files.length > 0) {
        const messages = [];

        // Iterate through the uploaded files and construct messages
        for (const file of req.files) {
            console.log(req.body.recipientId);
           console.log(req.body.senderId)


            const currentDate = new Date();
            const date = currentDate; 
            const time = currentDate.toTimeString().split(' ')[0]; // Format as HH:MM:SS

            // Construct the full file path (including the date directory)
            const datePath = date.toISOString().split('T')[0]; //
            const filePath = `/uploads/${datePath}/${file.filename}`; // Using the formatted path


               
            const message = ({
                senderId: req.body.senderId, 
                recipientId: req.body.recipientId ,
                messageContent: filePath, 
                contentType: 'file',
                date,
                time
            });

             // Save each message to your database
             const savedMessage = await Message.create(message);
             messages.push(savedMessage); // Push the saved message to the messages array
        }

        // Emit the new messages to all connected clients
        io.emit('newMessages', messages);
       // return res.json({ message: 'Files uploaded successfully', files: req.files.map(file => file.filename) });
       return res.json(messages);
    }
    return res.status(400).send('No files uploaded');
});
return router;
}

module.exports = setupMessageRoutes; // Export the setup function
