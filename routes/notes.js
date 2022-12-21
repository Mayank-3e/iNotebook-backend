const express=require('express')
const router=express.Router();
const fetchuser=require('../middleware/fetchuser')
const Note=require('../models/Note')
const { body, validationResult } = require('express-validator')

// Get all the notes using GET. Login required
router.get('/fetchallnotes',fetchuser, async(req,res)=>{
  try
  {
    const notes=await Note.find({user: req.user.id})
    res.send(notes)
  }
  catch (error) {res.status(500).send({error:error})}
})

// Add a new note using POST. Login required
router.post('/addnote',fetchuser,
  [
    body('title','Title must be at least 1 character').isLength({ min: 1 }),
    body('description','Description must be at least 1 character').isLength({ min: 1 })
  ],
  async(req,res)=>
  {
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
      return res.status(400).json({ errors: errors.array() });
    }
    const {title,description,tag}=req.body
    try
    {
      let note=new Note({
        user: req.user.id, title,description,tag
      })
      note=await note.save()
      res.json(note)
    }
    catch (error) {res.status(500).send({error:error})}
  }
)

// Update a note using PUT. Login required
router.put('/updatenote/:id',fetchuser,
  async(req,res)=>
  {
    const {title,description,tag}=req.body
    const newnote={}
    if(title) newnote.title=title
    if(description) newnote.description=description
    if(tag) newnote.tag=tag
    try
    {
      let note=await Note.findById(req.params.id)
      if(!note) return res.status(404).send({error: "Not Found"})
      if(note.user.toString()!==req.user.id) return res.status(401).send({error: "Not Allowed"})
      note=await Note.findByIdAndUpdate(req.params.id,{$set: newnote},{new:true})
      res.json(note)
    }
    catch (error) {res.status(500).send({error:error})}
  }
)

// Delete a note using DELETE. Login required
router.delete('/deletenote/:id',fetchuser,
  async(req,res)=>
  {
    try
    {
      let note=await Note.findById(req.params.id)
      if(!note) return res.status(404).send({error: "Not Found"})
      if(note.user.toString()!==req.user.id) return res.status(401).send({error: "Not Allowed"})
      note=await Note.findByIdAndDelete(req.params.id)
      res.json({"Success":"Note has been deleted",note})
    }
    catch (error) {res.status(500).send({error:error})}
  }
)
module.exports=router