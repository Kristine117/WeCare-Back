const { Op } = require('sequelize');
const Message = require('../model/Message');
const { exportDecryptedData, exportEncryptedData } = require('../auth/secure');
const { Json } = require('sequelize/lib/utils');

// Controller to handle retrieving messages
exports.getMessages = async (req, res,next) => {
    const { senderId, recipientId } = JSON.parse(req.headers.chatids);

    console.log(senderId,
        recipientId
        )
    const recipientIddecrypted = Number(await exportDecryptedData(recipientId.trim()));
    const senderIddecrypted = Number(await exportDecryptedData(senderId.trim()));

    try {
        let messages;
        console.log("this is recipient")
        console.log(recipientId);
        console.log(senderId);
        if (senderIddecrypted && recipientIddecrypted) {
            // Fetch messages from the database that match the sender and recipient
            messages = await Message.findAll({
                where: {
                    [Op.or]: [
                        { senderId: senderIddecrypted, recipientId: recipientIddecrypted },
                        { senderId: recipientIddecrypted, recipientId: senderIddecrypted }
                    ]
                },
                order: [['date', 'ASC']], // Optional: Order by date
            });
        } else {
            // Fetch all messages if no filters are applied
            messages = await Message.findAll();

        }
    
        const updatedMessages = messages.map(async(msg)=>{

            msg.dataValues['isForReceiver'] = Number(senderIddecrypted) !== Number(msg.dataValues.senderId);
            console.log("hereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")
            
            console.log(senderIddecrypted);
            console.log(msg.dataValues.senderId);
            console.log(msg.dataValues.isForReceiver)
            msg.dataValues['senderId'] = await exportEncryptedData(String(msg.dataValues.senderId));
            msg.dataValues['recipientId'] = await exportEncryptedData(String(msg.dataValues.recipientId));
            return msg.dataValues;

        })

        return res.status(200).send({
            isSuccess: true,
            message: "Successfully retrieve messages",
            messages: await Promise.all(updatedMessages)
        });
    } catch (error) {
        next(error)
    }
};

// Controller to handle sending messages
exports.sendMessage = async (req, res, io) => {
    const { senderId, recipientId, messageContent, contentType } = req.body;

    const recipientIddecrypted = Number(await exportDecryptedData(recipientId));
    const senderIddecrypted = Number(await exportDecryptedData(senderId));

    console.log("senderIddecrypted"+senderIddecrypted)

    try {
        const currentDate = new Date();
        const date = currentDate;
        const time = currentDate.toTimeString().split(' ')[0]; // Format as HH:MM:SS

        const message = await Message.create({
            senderId:senderIddecrypted,
            recipientId:recipientIddecrypted,
            messageContent,
            contentType,
            date,
            time
        });
        
        message.dataValues['isForReceiver'] = Number(senderIddecrypted) !== Number(message.dataValues.senderId);
        message.dataValues['senderId'] = await exportEncryptedData(String(message.dataValues.senderId));
        message.dataValues['recipientId'] = await exportEncryptedData(String(message.dataValues.recipientId));
           
        io.emit('receiveMessage',message); // Emit the message to all connected clients
      
    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({ error: 'Error sending message' });
    }
};

// Controller to handle file uploads
exports.uploadFiles = async (req, res, io) => {
    if (req.files && req.files.length > 0) {
        const messages = [];

        try {
            for (const file of req.files) {
                const currentDate = new Date();
                const date = currentDate;
                const time = currentDate.toTimeString().split(' ')[0]; // Format as HH:MM:SS

                const datePath = date.toISOString().split('T')[0]; // Date folder format
                const filePath = `/uploads/${datePath}/${file.filename}`; // Path for file

                const recipientIddecrypted = Number(await exportDecryptedData(req.body.recipientId));
                const senderIddecrypted = Number(await exportDecryptedData(req.body.senderId));

                const message = {
                    senderId: senderIddecrypted,
                    recipientId: recipientIddecrypted,
                    messageContent: filePath,
                    contentType: 'picture',
                    date,
                    time
                };

                const savedMessage = await Message.create(message);
                messages.push(savedMessage);
            }

            io.emit('newMessages', messages); // Emit the messages to clients
            return res.json(messages);
        } catch (error) {
            console.error('Error uploading files:', error);
            return res.status(500).json({ error: 'Error uploading files' });
        }
    } else {
        return res.status(400).send('No files uploaded');
    }
};
