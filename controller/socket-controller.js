
const Message = require('../model/Messages');
const { Op, TIME } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const loadMessages = async (socket, senderId, recipientId) => {
    try {
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId, recipientId },
                    { senderId: recipientId, recipientId: senderId }
                ]
            },
            order: [['date', 'ASC'], ['time', 'ASC']],
        });

        // Process messages to handle file paths
        const processedMessages = messages.map(msg => {
            // Split file paths if contentType is 'file'
            if (msg.contentType === 'file') {
                msg.messageContent = msg.messageContent.split(','); // Assuming messageContent is a comma-separated string
            }
            return msg;
        });

        socket.emit('loadedMessages', processedMessages);

        console.map(processedMessages)

    } catch (error) {
        console.error('Error loading messages:', error.message);
    }
};


// Function to handle sending a message
const sendMessage = async (msg, io) => {
    const senderId = msg.senderId;
    const recipientId = msg.recipientId;
    const messageContent = msg.content;
    const contentType = "Text";
    // Get the current date and time
    const currentDate = new Date();
    const date = currentDate; // You can use currentDate directly as a Date object
    const time = currentDate.toTimeString().split(' ')[0]; // Format as HH:MM:SS
    try {
        // Create a new message entry in the database
        const message = await Message.create({
            senderId,
            recipientId,
            messageContent,
            contentType,
            date, // Pass the Date object directly
            time, // Pass the time as HH:MM:SS
        }); 

        // Broadcast the new message to all clients
        io.emit('newMessage', message); // Send the full message object
    } catch (error) {
        console.error('Error sending message:', error);
    }
};

const uploadFiles = async (fileData, io) => {
    const { senderId, recipientId, files } = fileData;
    const contentType = 'file';
    const currentDate = new Date();
    const date = currentDate;
    const time = currentDate.toTimeString().split(' ')[0];

    try {
        // Create the message without the file path
        const newMessage = await Message.create({
            senderId,
            recipientId,
            messageContent: '', // Placeholder for now
            contentType,
            date,
            time
        });

        const messageId = newMessage.messageId; // Get the generated messageId

        // Save the files using the messageId as the folder name
        const uploadPath = path.join(__dirname, '..', 'uploads', messageId.toString());

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        const filePaths = []; // To store file paths for each uploaded file

        // Iterate through each file and save it
        for (const file of files) {
            const uniqueFileName = `${Date.now()}-${file.fileName}`;
            const filePath = path.join(uploadPath, uniqueFileName);

            // Convert ArrayBuffer to Buffer
            const buffer = Buffer.from(file.content);

            // Write the file buffer to disk
            fs.writeFileSync(filePath, buffer);

            // Add file path to the array
            filePaths.push(`/uploads/${messageId}/${uniqueFileName}`);
        }

        // Update the message entry with the correct file paths (join multiple paths if necessary)
        await newMessage.update({
            messageContent: filePaths.join(', ') // Save the relative paths as a comma-separated string or adjust as needed
        });

        console.log('Files saved:', newMessage);

        // Emit the updated message to the clients
        io.emit('newMessage', newMessage);

    } catch (error) {
        console.error('Error saving files:', error);
    }
};


module.exports = {
    loadMessages,
    sendMessage,
    uploadFiles
};
