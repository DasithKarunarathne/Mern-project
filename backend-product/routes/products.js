const router = require("express").Router();
//let Product= require ("../models/Product.js");
let Product = require("../models/Product.js");
console.log(Product.schema.obj); // Log the schema to verify its fields

//http://Localhost:8070/product/add

router.route("/add").post((req,res)=>{
   
    const name = req.body.name;
    const description = req.body.description;
    const price=Number(req.body.price);// number ekt convert krnnwa
    const stockQuantity=Number(req.body.stockQuantity);
    const category = req.body.category;

    const newProduct= new Product({                  
 
        name,
        description,
        price,
        stockQuantity,
        category
        
    })

    newProduct.save().then(()=>{
        res.json("Product Added")
    }).catch((err)=>{
        console.log(err);
    })


})

//http://Localhost:8080/product   //display

router.route("/").get((req,res)=>{
    
    Product.find().then((products)=>{  //find keyword eken okkom display wenwa
        res.json(products)
    }).catch((err)=>{
        console.log(err)
    })


})

//http://Localhost:8080/product /update/5fetywert5r6ytg

router.route("/update/:id").put (async(req,res) =>{
     let userId=req.params.id;
     const{name,description,  price,stockQuantity, category}=req.body;

     const updateProduct = {
        name,
        description,  
        price,
        stockQuantity, 
        category
        
     }

 const update = await Product.findByIdAndUpdate(userId,updateProduct)
 .then(() => {
    res.status(200).send({status:"User updated",user:update})
 }).catch((err)=>{
    console.log(err);
    res.status(500).send({status:"Error with updating data",error:err.message});
 })

})

//http://Localhost:8080/product/delete/5fetywert5r6ytg

router.route("/delete/:id").delete(async(req,res)=>{
     let userId=req.params.id;

     await Product.findByIdAndDelete(userId)
     .then(() => {
        res.status(200).send({status:"User deleted"});
     }).catch((err)=>{
        console.log(err.message);
        res.status(500).send({status:"Error with delete user",error:err.message});
     })
    
    })

   
    router.route("/get/:id").get(async (req, res) => {
        let userId = req.params.id;
        try {
            const user = await Product.findById(userId);
            if (!user) {
                return res.status(404).send({ status: "User not found" });
            }
            res.status(200).send({ status: "User fetched", user });
        } catch (err) {
            console.log(err.message);
            res.status(500).send({ status: "Error with get user", error: err.message });
        }
    });

module.exports=router;