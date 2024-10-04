const multer = require('multer');
const Message = require('../models/Message');

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage }).array('files', 10); // Multiple file uploads

// Send text message
exports.sendTextMessage = async (req, res) => {
    const { senderId, recipientId, messageContent } = req.body;
    
    try {
        const newMessage = await Message.create({
            senderId,
            recipientId,
            messageContent,
            contentType: 'text',
            date: new Date(),
            time: new Date()
        });

        res.status(200).json({ success: true, message: newMessage });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to send text message' });
    }
};

// Upload file message
exports.uploadFileMessage = async (req, res) => {
    const { senderId, recipientId } = req.body;

    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Failed to upload files' });
        }

        const filePaths = req.files.map(file => `/uploads/${file.filename}`);

        try {
            const messages = await Promise.all(
                filePaths.map(filePath =>
                    Message.create({
                        senderId,
                        recipientId,
                        messageContent: filePath,
                        contentType: 'file',
                        date: new Date(),
                        time: new Date()
                    })
                )
            );

            res.status(200).json({ success: true, messages });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Failed to save file messages' });
        }
    });
};
