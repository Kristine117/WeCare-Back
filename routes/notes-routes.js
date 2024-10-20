const express = require('express');
const {createNote,getALLNotes,deleteNote ,updateNote} = require('../controller/notes-controlller');
const router = express.Router();

router.post("/create",createNote);
router.get("/getAllNotes/:userId",getALLNotes)
router.delete('/delete', deleteNote);
router.put("/updateNote",updateNote)

module.exports= router;

