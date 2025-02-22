import { Router } from "express";

const router = Router();

//import Feedback, { find, findById, findByIdAndUpdate, findByIdAndDelete } from "../models/feedback.js";
//const feedback = require("../models/feedback");

//test
router.get("/test",(req,res)=>res.send("Employess routes working"));


//not rusirus video route scene eka*****

router.route("/add").post((req,res)=>{

    const firstname = req.body.firstName;
    const lastname = req.body.lastName;
    const email = req.body.email;
    const message = req.body.message;
    
    const newFeedback = new Feedback({
        firstname,
        lastname,
        email,
        message
    })

    newFeedback.save().then(()=>{
        res.json("Feedback Added")
    }).catch((err)=>{
        console.log(err);
    })

})


/*router.post("/",(req,res)=>{
    console.log("Request body:", req.body);
    Feedback.create(req.body)
    .then(()=>res.json({msg: "Feedback added successfully"}))
    .catch((error)=> res.status(400).json({msg: "Feedback adding failed"}) );

})*/

router.get("/",(req,res)=>{
    find()
    .then((feedback)=>res.json(feedback))
    .catch(()=>res.status(400).json({msg: "No feedback found"}));
     
})

router.get("/:id",(req,res)=>{
    findById(req.params.id).then((feedback)=>res.json(feedback)).catch(()=>res.status(400).json({msg: "Cannot find the feedback"}));

})


router.put("/updatefeedback/:id", (req, res) => {
    findByIdAndUpdate(req.params.id, req.body)
      .then(() => res.json({ msg: "Update successful" }))
      .catch(() => res.status(400).json({ msg: "Update failed" }));
  })
  
  router.delete("/:id", (req, res) => {
    findByIdAndDelete(req.params.id)
        .then(() => res.json({ msg: "Deleted successfully" }))
        .catch(() => res.status(400).json({ msg: "Cannot be deleted" }));
});


export default router;