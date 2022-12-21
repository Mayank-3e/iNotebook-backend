const express=require('express')
const User=require('../models/User')
const Note=require('../models/Note')
const router=express.Router();
const { body, validationResult } = require('express-validator')
const bcrypt=require('bcryptjs');
const jwt = require('jsonwebtoken')
const JWT_SECRET=process.env.JWT_SECRET
const fetchuser=require('../middleware/fetchuser')

// Create a User using POST: "/api/auth/createuser". No login required
router.post('/createuser',
  [
  body('name','Enter a valid name').isLength({ min: 1 }),
  body('email','Enter a valid email').isEmail(),
  // password must be at least 8 chars long
  body('password','Password must be atleast 8 characters').isLength({ min: 8 })
  ],
  async (req, res) =>
  {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
      return res.status(400).json({ errors: errors.array() });
    }

    try
    {
      let user = await User.findOne({email: req.body.email})
      if(user)
      {
        return res.status(400).json({error: 'This email is already registered!'})
      }
      const salt=await bcrypt.genSalt()
      const secPass=await bcrypt.hash(req.body.password,salt)
      user = await User.create
      ({
        name: req.body.name,
        email: req.body.email,
        password: secPass
      })
      const data=
      {
        user:{id: user.id}
      }
      const authToken=jwt.sign(data,JWT_SECRET)
      res.send({authToken})
    }
    catch (error) {res.status(500).send({error: error})}
  }
);

// Authenticate a User using POST: "/api/auth/login". No login required
router.post('/login',
  [
  body('email','Enter a valid email').isEmail(),
  // password must be at least 8 chars long
  body('password','Password must be atleast 8 characters').isLength({ min: 8 })
  ],
  async (req, res) =>
  {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
      return res.status(400).json({ errors: errors.array() });
    }

    const {email,password}=req.body
    try
    {
      let user=await User.findOne({email})
      if(!user) return res.status(400).json({error: "User does not exist"})
      const pswdCompare=await bcrypt.compare(password,user.password)
      if(!pswdCompare) return res.status(400).json({error: "Wrong password"})
      const data=
      {
        user:{id: user.id}
      }
      const authToken=jwt.sign(data,JWT_SECRET)
      res.send({authToken})
    }
    catch (error) {res.status(500).send({error: error})}
  }
);

// Get User details using POST: "/api/auth/getuser". Login required
router.post('/getuser', fetchuser,
  async (req, res) =>
  {
    let userid=req.user.id
    try
    {
      const user=await User.findById(userid).select("-password")
      res.send({user})
    }
    catch (error) {res.status(500).send({error: error})}
  }
);
  
  // Delete user using DELETE. Login required
router.delete('/deleteuser',fetchuser,
  async(req,res)=>
  {
    try
    {
      await Note.deleteMany({"user":req.user.id})
      await User.findByIdAndDelete(req.user.id)
      res.status(200).send()
    }
    catch (error) {res.status(500).send({error:error})}
  }
)
module.exports=router