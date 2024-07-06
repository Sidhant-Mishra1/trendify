const express=require('express');
const app=express();
const mongoose=require('mongoose');
const jwt=require('jsonwebtoken');
// const path=require('path')
const multer=require('multer');
const path=require('path');
// Used to get access to backend directory
const cors=require('cors');
require('dotenv').config()


// deployment

// const __dirname=path.resolve()

const port=4000;
// 

app.use(express.json());

// Whatever req we will get from json will be passed through json

app.use(cors());

// use to connect express and react

// Database connection with Mongodb
const uri_mongodb=process.env.MONGODB_URI
mongoose.connect(uri_mongodb)

// API Creation

app.get("/",(req,res)=>{
    res.send("Express app is running");
})


// Image storage Engine

const storage=multer.diskStorage({
    destination: './upload/images',
    filename:(req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

// This part sets up the multer disk storage configuration.
// Uploaded files will be stored in the './upload/images' directory.
// The filename function generates a unique filename based on the original filename, current timestamp, and file extension.

const upload=multer({storage:storage})

// Creating upload endpoint for images

app.use('/images',express.static('upload/images'));

// This middleware serves static files from the 'upload/images' directory when a request is made to the '/images' endpoint. It allows access to the uploaded images directly.
app.post("/upload",upload.single('product'),(req,res)=>{
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})

// Schema for creating products
const Product=mongoose.model("Product",{
    id:{
        type:Number,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    new_price:{
        type:Number,
        required:true,
    },
    old_price:{
        type:Number,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now(),
    },
    available:{
        type:Boolean,
        default:true,
    },
})

app.post('/addproduct',async (req,res)=>{
    let products=await Product.find({});
    // This products variable helps us to show all product in a single array
    let id;
    if(products.length>0){
        let last_product_array=products.slice(-1);
        let last_product=last_product_array[0];
        id=last_product.id + 1;
    }
    else{
        id=1;
    }
    const product=new Product({
        id:id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,
    })
    // console.log(product);
    // console.log("Saved");
    res.json({
        success:true,
        name:req.body.name,
    })
    await product.save();
})

// Creating API for deleting data

app.post('/removeproduct',async(req,res)=>{
    await Product.findOneAndDelete({id:req.body.id });
    console.log("removed");
    res.json({
        success:true,
        name:req.body.name
    })
})

// Creating API for getting all products

app.get('/allproducts',async(req,res)=>{
    let products=await Product.find({});
    // console.log("All products fetched")
    res.send(products)
})

// Schema creating for User model

const Users=mongoose.model('Users',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now,
    }
})

// Creating endpoint for registering the user

app.post('/signup',async(req,res)=>{
    console.log('Received request body:', req.body);
    let check=await Users.findOne({email:req.body.email});
    if(check){
        return res.status(400).json({success:false,errors:"existing user found with same email id"});
    }
    let cart={};
    for (let i = 0; i < 300; i++) {
        cart[i]=0;
    }
    const user=new Users({
        username:req.body.username,
        email:req.body.email,
        password:req.body.password,
        // cartData:cart,
    })
    await user.save();

    const data={
        user:{
            id:user.id
        }
    }

    const token=jwt.sign(data,'secret_ecom');
    res.json({success:true,token});
})

// Creating endpoint for user login

app.post('/login',async(req,res)=>{
    let user=await Users.findOne({email:req.body.email});
    if(user){
        const passCompare=req.body.password===user.password;
        if(passCompare){
            const data={
                user:{
                    id:user.id
                }
            }
            const token=jwt.sign(data,'secret_ecom');
            res.json({success:true,token});
        }
        else{
            res.json({success:false,errors:"Wrong password"});
        }
    }
    else{
        res.json({success:false,errors:"Wrong Email-id"});
    }
})


// Creating endpoint for new collection data

app.get('/newcollections',async(req,res)=>{
    let products=await Product.find({});
    let newcollection=products.slice(1).slice(-20)
    console.log('new collections fetched')
    res.send(newcollection);
})

// Creating endpoint for popular in women category

app.get('/popularinwomen',async(req,res)=>{
    let products=await Product.find({category:"women"});
    let popularinwomen=products.slice(1).slice(-10)
    console.log('Popular in women fetched')
    res.send(popularinwomen);
})


// Creating middleware to fetch user 

const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ errors: "Please authenticate using a valid token" });
    }

    try {
        const data = jwt.verify(token, 'secret_ecom');
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({ errors: "Please authenticate using a valid token" });
    }
};

app.post('/addtocart', fetchUser, async (req, res) => {
    console.log('added',req.body.itemId);
    try {
        let userData = await Users.findOne({ _id: req.user.id });
        if (!userData) {
            return res.status(404).send({ errors: "User not found" });
        }

        // Ensure cartData is initialized as an object
        if (!userData.cartData) {
            userData.cartData = {};
        }

        // Check if itemId exists in cartData before incrementing
        if (!userData.cartData[req.body.itemId]) {
            userData.cartData[req.body.itemId] = 0;
        }

        userData.cartData[req.body.itemId] += 1;
        await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });

        res.status(200).json({ message: "ADDED" }); // Send JSON response
    } catch (error) {
        console.error("Error adding item to cart:", error);
        res.status(500).json({ errors: "Internal Server Error" }); // Send JSON error response
    }
});

// creating endpoint to remove data from cartdata

app.post('/removefromcart',fetchUser,async(req,res)=>{

    console.log('removed',req.body.itemId);
    try {
        let userData = await Users.findOne({ _id: req.user.id });
        if (!userData) {
            return res.status(404).send({ errors: "User not found" });
        }

        // Ensure cartData is initialized as an object
        if (!userData.cartData) {
            userData.cartData = {};
        }

        // Check if itemId exists in cartData before incrementing
        if (!userData.cartData[req.body.itemId]) {
            userData.cartData[req.body.itemId] = 0;
        }
        if(userData.cartData[req.body.itemId]>0)userData.cartData[req.body.itemId] -= 1;
        await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });

        res.status(200).json({ message: "Removed" }); // Send JSON response
    } catch (error) {
        console.error("Error adding item to cart:", error);
        res.status(500).json({ errors: "Internal Server Error" }); // Send JSON error response
    }

});



// creating endpoint to get cartdata

app.post('/getcart', fetchUser, async (req, res) => {
    try {
        console.log("Getcart");
        let userData = await Users.findOne({ _id: req.user.id });
        res.json(userData.cartData);
        console.log("res ",userData);
    } catch (error) {
        console.error("Error fetching cart data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});



// deployment



// app.use(express.static(path.join(__dirname,"/frontend/dist")))

// app.get("*",(req,res)=>{
//     res.sendFile(path.join(__dirname,"frontend","dist","index.html"))
// })

// 

app.listen(port,(error)=>{
    if(!error)console.log("Server Running on Port "+port);
    else{
        console.log("Error : " + error);
    }
});
