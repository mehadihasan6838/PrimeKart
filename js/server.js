// -------------------DATABASE CONNECTION PROCESS---------
require('dotenv').config();
const pool = require("./dataBase.js");

const { response } = require("express");

//-------------------REQUIRE EXPRESS JS-------------------
const express = require("express"); 
const app = express();  

//-------------------------BYCRIPT INSTALL----------------
const bcrypt = require("bcrypt"); 


const bodyParser = require("body-parser"); 
const cors = require("cors");  

// -----------------------MIDDLEWARE SETUP----------------
app.use(bodyParser.json());
app.use(cors());


//------------------------MULTER REQUIRE------------------
const multer = require("multer");
const path = require('path');
const fs = require("fs");
// const { use } = require("react");

app.use(express.json());


// ---------------- STATIC FOLDERS ----------------
app.use(express.static(path.join(__dirname, "../")));
app.use("/js", express.static(path.join(__dirname, "../js")));
app.use("/images", express.static(path.join(__dirname, "../images")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/profile", express.static(path.join(__dirname, "../profiles")));

// Static files serve করা (optional)
app.use(express.static(path.join(__dirname, "../pages"))); 

// Root route serve করা
app.use("/pages", express.static(path.join(__dirname, "../pages")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../pages/index.html"));
});

///REGISTRATION API ------------------
app.post("/api/register",async(req,res) =>{
          
     const {email,password} = req.body;

     if(!email || !password){
      return res.status(400).json({message:'email and password are required'});
     }
      
     try{
        const hashedPassword = await bcrypt.hash(password, 10);
         const query = 'INSERT INTO users(email,password_hash) VALUES (?,?)';
         await pool.execute(query,[email,hashedPassword])
         return res.status(201).json({message:'User registered successfully'});
     } catch (error) {
         console.error("Registration error:", error);

         if (error.code === 'ER_DUP_ENTRY') {
             return res.status(409).json({message: 'This email already exists'});
         }else{
            return res.status(500).json({message: 'Internal server error'});
         }
     }
})

//REGISTRATION API ENDS



// LOGIN API PROCESS START---------------------
app.post('/api/login',async(req,res) => {
   
    const {email,password} = req.body;

    if(!email || !password){
        return res.status(400).json({message:'email and password are required'});
    }

    try{
        const query = 'SELECT password_hash,user_id,is_admin FROM users WHERE email = ?';
        const [rows] = await pool.execute(query,[email]);
         
          if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        
        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

       if(passwordMatch){
            const userId = user.user_id;
            const isAdmin = user.is_admin;
           return res.status(200).json({message:'Login successful', userId, isAdmin});
       }

       else{
        return res.status(401).json({message:'Invalid password'});
       }

    } catch(err){
        console.error("Login error:", err);
        return res.status(500).json({message:'Error'});
    }
} ) 
// LOGIN API PROCESS ENDS


//FORGOT API START HERE 
app.post('/api/forgot_password', async(req,res) => {

     const {userId,newPassword} = req.body;
     if(!userId || !newPassword){
      return res.status(400).json({message:'userId and newPassword are required'});
     }

     try{
    const hashPassword = await bcrypt.hash(newPassword, 10);
    
    const query = 'UPDATE users SET password_hash = ? WHERE user_id = ?'
    await pool.execute(query,[hashPassword,userId]);

    return res.status(200).json({message:'Password updated successfully'});
     }catch(err){
        console.error("Forgot password error:", err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({message: 'password already exists'});
        }else{
            return res.status(500).json({message: 'Internal server error'});
        }
     }

})
//FORGOT API ENDS HERE


// DASHBOARD START HERE -------------------------------------------------------------------


//MULTER MIDDLEWARE FOR FILE HANDLING
app.use('/uploads', express.static('uploads'));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
   const filePath = path.join('uploads', file.originalname);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    } else {
      cb(null, file.originalname);
    }

  },
});

const upload = multer({ storage: storage });

//ADD PRODUCT API  START HERE
app.post('/api/add_products',upload.single("image"), async(req,res) => {

    const {name, category,quantity,price,description} = req.body;
     const image = req.file ? req.file.filename : null;

    if(!name || !category || !quantity || !price || !image || !description){
        return res.status(400).json({message:'All fields are required'});
    }

    try{
        const query = 'INSERT INTO products(product_name,price,category,stock_quantity,image_url,description) VALUES (?,?,?,?,?,?)';
        await pool.execute(query,[name,price,category,quantity,image,description]);
        return res.status(201).json({message:'Product added successfully'});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'Something went wrong!'});
    }
});




//TOTAL SALES API START HERE 
app.get('/api/total_sales', async(req,res) => {
    
    try{
    const query = `SELECT SUM(total_amount) AS total_sales FROM orders`;
    const [rows] = await pool.execute(query);
    return res.json({ total_sales: rows[0].total_sales || 0 });
    }catch(err){
        console.error("Error fetching total sales:", err);
        res.status(500).json({message:'Something went wrong'});
    }

})


//TOTAL ORDERS API START HERE 
app.get('/api/total_orders', async(req,res) => {

    try{
        const query = `SELECT SUM(total_amount) AS total_sales_this_month,
             COUNT(*) AS total_orders_this_month
      FROM orders
      WHERE MONTH(order_date) = MONTH(CURRENT_DATE())
        AND YEAR(order_date) = YEAR(CURRENT_DATE())`;


        const [rows] = await pool.execute(query);
        return res.json({total_orders: rows[0].total_orders_this_month || 0});
    }catch(err){
        console.error("Error fetching total orders:", err);
        return res.status(500).json({message:'Something went wrong'});
    }
})



// TOTAL CUSTOMER COUNT START HERE

app.get('/api/total_customers',async(req,res) => {
    try{
        const query = `SELECT COUNT(DISTINCT user_id) as total_customer FROM orders`;
        const [rows] = await pool.execute(query);
        return res.json({total_customers: rows[0].total_customer || 0});
    }catch(err){
        console.error("Error fetching total customers:", err);
        return res.status(500).json({message:'Something went wrong'});
    }
})



//RECENT ACTIVITY START HERE
app.get('/api/recent_activity', async(req,res) => {

    try{
        const query = `SELECT o.order_id, u.user_id, o.order_date
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      ORDER BY o.order_date DESC
      LIMIT 4`

      const [rows] = await pool.execute(query);
      return res.json(rows);
    }catch(err){
        console.error("Error fetching recent activity:", err);
        res.status(500).json({message:'Something went wrong'});
    }
})



//VIEW ALL PRODUCTS SECTION STARTS HERE
app.get('/api/view_all_products',async(req,res) => {
     try{

        const query = 'SELECT * FROM products';
        const [rows] = await pool.execute(query);
        return res.json({ all_products: rows });

     }catch(err){
         console.error("Error fetching all products:", err);
         return res.status(500).json({message:'Something went wrong'});
     }
})



//DELETE PRODUCT API START HERE
app.delete('/api/delete_product/:productCode',async(req,res) =>{

    const productCode = req.params.productCode;

    if(!productCode){
        return res.status(400).json({message:'Product code is required'});
    }

    try{
        const query = 'DELETE FROM products WHERE product_id = ?';
        const [result] = await pool.execute(query,[productCode]);

        if(result.affectedRows === 0){
            return res.status(404).json({message:'Product not found'});
        }

        return res.json({message:'Product deleted successfully'});
    }catch(err){
        console.error("Error deleting product:", err);
        return res.status(500).json({message:'Something went wrong'});
    }
})



//VIEW USER INFO API START HERE
app.get('/api/view_users_info',async(req,res) => {

    try{
        const query = `SELECT 
        u.user_id,
        MAX(o.full_name) AS name,
        u.email, COUNT(o.order_id) AS total_orders
         FROM users u 
         INNER JOIN orders o ON u.user_id = o.user_id 
         GROUP BY u.user_id,o.full_name,u.email 
         ORDER BY u.user_id 
         LIMIT 4`;

       const [rows] = await pool.execute(query);
       return res.json(rows);
    }catch(err){
        console.error("Error fetching user info:", err);
        return res.status(500).json({message:'Something went wrong'});
    }
})



//VIEW ALL BUYERS BTN API 
app.get('/api/view_users_info_all',async(req,res) => {

    try{  
        const query = `SELECT 
        u.user_id,
        MAX(o.full_name) AS name,
        u.email, COUNT(o.order_id) AS total_orders
         FROM users u 
         INNER JOIN orders o ON u.user_id = o.user_id 
         GROUP BY u.user_id,o.full_name,u.email 
         ORDER BY u.user_id` 

       const [rows] = await pool.execute(query);
       return res.json(rows);

    }catch(err){

        console.error("Error fetching user info:", err);
        return res.status(500).json({message:'Something went wrong'});
    }
})




//VIEW ALL USER API START HERE
app.get('/api/view_all_users',async(req,res) => {

    try{

        const query = `SELECT * FROM users LIMIT 4`;
        const [rows] = await pool.execute(query);

        return res.json({ all_users: rows });

    }catch(err){
        console.error("Error fetching all users:", err);
        return res.status(500).json({message:'Something went wrong'});
    }
})



//VIEW ALL USER INFO LIST
app.get('/api/full_user_info',async (req,res)=> {

    try{
        const query = `SELECT * FROM users`;
        const [rows] = await pool.execute(query);

        return res.json({ all_users: rows });
    }catch(err){
        console.error("Error fetching all user info:", err);
        return res.status(500).json({message:'Something went wrong'});
    }
})

//DASHBOARD ENDS HERE---------------------------------





//GET ALL PRODUCTS API START HERE
     app.get('/api/get_products',async(req,res) =>{
        
        try{
            const query = 'SELECT * FROM products';
            const [rows] = await pool.execute(query);
            if(rows.length === 0){
                return res.json([]);
            }else{
                return res.json(rows);
            }
        }catch(err){
            console.error("Error fetching products:", err);
            return res.status(500).json({message:'Something went wrong'});
        }
     }) 
//GET ALL PRODUCTS  API ENDS HERE



//VIEW PRODUCT DETAILS API STARTS HERE
app.get('/api/get_product', async (req, res) => {
    const productId = req.query.id;
    try {
        const query = 'SELECT * FROM products WHERE product_id = ?';
        const [rows] = await pool.execute(query, [productId]);
        return res.json(rows[0] || {});
    } catch (err) {
        console.error("Error fetching product details:", err);
        return res.status(500).json({ message: 'Something went wrong' });
    }
});
//VIEW PRODUCT DETAILS API ENDS HERE




//RELATED ITEMS API START HERE
app.get('/api/get_product_by_id',async (req,res) => {

    try{

        const id = req.query.id;
        if(!id){
            return res.status(400).json({message:'Product ID is required'});
        }

        const [rows] =await pool.execute('SELECT * FROM products WHERE product_id = ?',[id]);
        if(rows.length === 0){
            return res.status(404).json({message:'Product not found'});
        }

        return res.json(rows[0]);
    }catch(err){
        console.error("Error fetching product by ID:", err);
        return res.status(500).json({message:'Something went wrong'});
    }
    
})



app.get('/api/get_related_products', async (req,res) => {

    try{
        const {category,excludeId} = req.query;
        const excludeIdNum = Number(excludeId);
        if(!category){
            return res.status(400).json({message:'Category is required'});
        }

        const query = 'SELECT * FROM products WHERE LOWER(category) = LOWER(?) AND product_id != ?';
        if(isNaN(excludeIdNum)){
            return res.status(400).json({message:'Invalid product ID'});
        }
        const [rows] = await pool.execute(query,[category,excludeIdNum]);
        return res.json(rows);
    }catch(err){
        console.error("Error fetching related products:", err);
        return res.status(500).json({message:'Something went wrong'});
    }
})
//RELATED ITEMS API ENDS HERE



// BUYERS DETAILS API START HERE
app.post('/api/buyers', async(req,res) => {

    try{
    const {userId,fullName,phone,address,city,zip,country,paymentAmount,product_id} = req.body;
    if(!userId || !fullName || !phone || !address || !city || !zip || !country || !paymentAmount ||!product_id){
        return res.status(400).json({message:'All fields are required'});
    }

    const query = 'INSERT INTO orders(user_id,full_name,phone_number,address,city,zip,country,total_amount,product_id) VALUES (?,?,?,?,?,?,?,?,?)';
    await pool.execute(query,[userId,fullName,phone,address,city,zip,country,paymentAmount,product_id]);
    return res.status(201).json({message:'Product purchased Successfully!'});
    }catch(err){
        console.log("Error adding buyer details:", err);
        return res.status(500).json({message:'Something went wrong'});
    }

})




//INSERT MESSAGE API START HERE 
app.post('/api/insert_messages',async(req,res) => {

    try{
        const {senderId,receiverId,message} = req.body;

      if (!senderId || !receiverId || !message || message.trim() === '') {
      return res.status(400).json({ message: 'Sender, Receiver and Message are required!' });
         }
        const query = `INSERT INTO messages (sender_id, receiver_id, message_text) VALUES (?,?,?)`
        await pool.execute(query, [senderId, receiverId, message.trim()]);

        return res.status(201).json({message:'Message sent sucessfully!'});

    }catch(err){
        console.log("Error inserting message:", err);
        return res.status(500).json({ message: 'Something went wrong' });
    }
})


//GET MESSAGE API START HERE 
app.get('/api/get_messages',async(req,res) => {

    try{
         const userId = Number(req.query.userId);
         if(!userId){
             return res.status(400).json({message:'User ID is required'});
         }
        const query = `SELECT sender_id, receiver_id, message_text, created_at
      FROM messages
      WHERE sender_id = ? OR receiver_id = ?
      ORDER BY created_at ASC`;

        const [rows] = await pool.execute(query, [userId, userId]);
        return res.json({messages: rows});
    }catch(err){
        console.log("Error fetching messages:", err);
        return res.status(500).json({message:'Something went wrong'});
    }
})


//GET_UNREAD_MESSAGE_FROM_USER API START HERE
app.get('/api/get_unread_message_from_user',async(req,res) => {

    try{
        const query = `SELECT DISTINCT(sender_id) FROM messages WHERE receiver_id = 1`;
        const [rows] = await pool.execute(query);
        return res.json({message:rows})
    }catch(err){
        console.log("Error fetching unread messages:", err);
        return res.status(500).json({message:'Something went wrong'});
    }
})


//LOAD MESSAGE FOR ADMIN CHAT BOX API START HERE 
app.get('/api/load_messages_for_admin',async(req,res) => {
     
    try{
        const sender_id = req.query.sender_id;
        if(!sender_id) return res.status(400).json({message:'Sender ID is required'});

        const query = `SELECT * FROM messages WHERE sender_id = ? OR receiver_id = ? ORDER BY created_at ASC`;
        const [rows] = await pool.execute(query, [sender_id, sender_id]);

        await pool.execute(`UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = 1`, [sender_id]);

        return res.json({messages: rows});

    }catch(err){
        console.log("Error loading messages for admin:", err);
        return res.status(500).json({message:'Something went wrong'});
    }
})


//INSERT ADMIN REPLY API
app.post('/api/insert_admin_message',async(req,res) => {

    const {sender_id,receiver_id,message_text} = req.body;

    if (!sender_id || !receiver_id || !message_text || message_text.trim() === '') {
        return res.status(400).json({ message: 'Sender, Receiver and Message are required!' });
    }
  
    try{
    const query = `INSERT INTO messages (sender_id, receiver_id, message_text) VALUES (?,?,?)`
    await pool.execute(query, [sender_id, receiver_id, message_text.trim()]);

    return res.status(201).json({message:'Message sent sucessfully!'});

    }catch(err){
        console.log("Error inserting admin message:", err);
        return res.status(500).json({message:'Something went wrong'});
    }


})


//PRICE LOW TO HIGH API START HERE
app.get('/api/price_low_to_high',async(req,res) => {

    try{
        const query = `SELECT * FROM products ORDER BY price ASC`;
        const [rows] = await pool.execute(query);
        return res.json({products: rows});
    }catch(err){
        console.log("error fetching data",err);
        return res.status(500).json({message:'Something went wrong'});
    }
})

//PRICE HIGHT TO LOW API START HERE
app.get('/api/price_high_to_low',async(req,res) => {

    try{
        const query = `SELECT * FROM products ORDER BY price DESC`;
        const [rows] = await pool.execute(query);
        return res.json({products: rows});
    }catch(err){
        console.log("error fetching data",err);
        return res.status(500).json({message:'Something went wrong'});
    }
})


//CATEGORY FILTER API START  HERE
app.get('/api/category_filter',async(req,res) => {

    try{
        const {category} = req.query;
        if(!category) return res.json({message:'Category is required'});

        const query = `SELECT * FROM products WHERE category = ?`;
        const [rows] = await pool.execute(query, [category]);
        return res.json({products: rows});

    }catch(err){
        console.log("Error fetching category products:", err);
        return res.status(500).json({message:'Something went wrong'});
    }

});


//USER REPORTS API HANDLE HERE
app.post('/api/sent_report',async(req,res) => {
     
    try{
        const {userId,report_title,report_text,urgency} = req.body;
        const query = `INSERT INTO reports (user_id,report_title,report_text,urgency) VALUES (?,?,?,?)`
        await pool.execute(query,[userId,report_title,report_text,urgency]);

        return res.json({message:'Report sent successful'})
    }catch(err){
        console.log('error fetching data',err);
        return res.status(500).json({message:'Report sent successfully failed'})
    }
})



//GET REPORTS API START FROM HERE
app.get('/api/get_reports', async(req,res) => {
  try{
    const query = `SELECT * FROM reports ORDER BY created_at DESC`; // Latest first
    const [rows] = await pool.execute(query);
    return res.json({report: rows});
  } catch(err){
    console.log(err);
    return res.status(500).json({message: "No reports found"});
  }
});


//TOP PRODUCTS API START FROM HERE
app.get("/api/top_products",async(req,res) =>{
      
    try{

        const query = `
            SELECT 
             p.product_name,
             COUNT(o.product_id) AS top_sold
             FROM orders AS  o
             JOIN products AS p ON o.product_id = p.product_id
             GROUP BY p.product_id, p.product_name
             ORDER BY  top_sold DESC
             LIMIT 5
             `;

        const [rows] = await pool.execute(query);

        return res.status(200).json({topProduct:rows})

    }catch(err){
        return res.status(500).json({message:`errro fetching top products`})
    }
})


//USER DASHBOADR API START HERE--------------------------------------------------------------------------------------


// MULTER HANDLE FOR PROFILE STORAGE 
app.use('/profiles', express.static('profiles'));
const updateProfileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'profiles/'); 
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '_' + file.originalname;
    cb(null, uniqueName);
  }
});

if (!fs.existsSync("profiles")) {
  fs.mkdirSync("profiles", { recursive: true });
}

const updateProfile = multer({ storage: updateProfileStorage });

// UPDATE PROFILE API
app.post('/api/update_profile', updateProfile.single('profile_pic'), async (req, res) => {
  const { user_id, full_name, phone, address, dob, gender } = req.body;

  if (!user_id || !full_name || !phone || !address || !dob || !gender) {
    return res.status(400).json({ message: 'Invalid information' });
  }

  const profilePic = req.file ? req.file.filename : null;

  try {
    // Check user exists
    const [userExists] = await pool.execute("SELECT * FROM users WHERE user_id=?", [user_id]);
    if (userExists.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [rows] = await pool.execute("SELECT * FROM user_profiles WHERE user_id=?", [user_id]);

    if (rows.length > 0) {
      // Update
      const newProfilePic = profilePic ? profilePic : (rows[0].profile_pic || 'default.png');
      await pool.execute(
        `UPDATE user_profiles 
         SET full_name=?, phone=?, address=?, dob=?, gender=?, profile_pic=? 
         WHERE user_id=?`,
        [full_name, phone, address, dob, gender, newProfilePic, user_id]
      );
    } else {
      // Insert
      await pool.execute(
        `INSERT INTO user_profiles (user_id, full_name, phone, address, dob, gender, profile_pic)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user_id, full_name, phone, address, dob, gender, profilePic || 'default.png']
      );
    }

    return res.json({ message: 'Profile saved successfully' });
  } catch (err) {
    console.error("Error updating profile:", err);
    return res.status(500).json({ message: 'Something went wrong!' });
  }
});





//LOAD USER PROFILE PIC SATRT HERE ----------------------------------------
app.get(`/api/get_profile_pic`,async(req,res) =>{
    const userId = req.query.user_id;
   if(!userId){
    return res.status(400).json({message:"user id not found"})
   }

   try{
     const query = `SELECT full_name, user_id, profile_pic FROM user_profiles WHERE user_id = ?`;
        const [rows] = await pool.execute(query, [userId]);

        let profile;

        if (rows.length === 0) {
            profile = {
                full_name: "Default User",
                user_id: userId,
                profile_pic: "default_profile.png"
            };
        }else {
            profile = rows[0];
            if (!profile.profile_pic) {
                profile.profile_pic = "default_profile.png";
            }
        }

        return res.status(200).json({ profiles: profile });
   }catch(err){
    console.log("err fetching data,err");
    return res.status(500).json({message:"profile pic laod failed"})
   }
})



//GET USER TOTAL ORDERS API START HERE 
app.get("/api/get_user_total_orders",async(req,res) => {

    const user_id = req.query.user_id;
    if(!user_id){
        return res.status(404).json({message: "user id not found"})
    }

    try{
        const query = `SELECT COUNT(*) as total_orders FROM orders WHERE user_id =?`
        const [rows] = await pool.execute(query,[user_id]);
        if(rows.length === 0){
            return res.status(404).json({message:"Orders not found"});
        }

        return res.status(200).json({ total_orders: rows[0].total_orders });

    } catch(err){
        return res.status(500).json({message:`something went wrong!!`})
    }
})



//USER TOTAL BILL VIEW API START HERE
app.get("/api/get_total_bill",async(req,res) => {
    const userId = req.query.user_id;

    if(!userId){
        return res.status(404).json({message:"user Id not found"})
    }

    try{
        
        const query = `SELECT SUM(total_amount) as total_bill FROM orders WHERE user_id =?`
        const [rows] = await pool.execute(query,[userId])

        return res.status(200).json({totalBill:rows[0].total_bill})

    }catch(err){
        return res.status(500).json({message:"error fetching total bill!!!"})
    }
})




// USER TORTAL MESSAGE COUNT API START HERE
app.get("/api/get_total_message_count",async(req,res) =>{

    const user_id = req.query.user_id;
    if(!user_id){
        return res.status(404).json({message:"User id not found"})
    }

    try{
    const query = `SELECT COUNT(*) as total_message FROM messages WHERE sender_id =?`
    const [rows] = await pool.execute(query,[user_id]);

             if(rows.length === 0){
            return res.status(404).json({message:"Messages  not found"});
        }

    return res.status(200).json({totalMessage:rows[0].total_message});
    }
    catch(err){
        return res.status(500).json({message:"something went wrong when fetching total message"})
    }

})


//USER ALL PRODUCTS VIEW API START HERE
app.get(`/api/user_all_purchase_products`,async(req,res) =>{

    const userId = req.query.user_id;
    if(!userId){
   return res.status(404).json({message:"User Id not found"})
    }

    try{
       
        const query = `SELECT o.order_id,o.order_date,p.product_name,p.price,p.category
            FROM orders AS o        
            JOIN products as p ON o.product_id = p.product_id  
            WHERE user_id = ?
        `;

        const [rows] =await pool.execute(query,[userId])

        return res.status(200).json({product:rows})

    }catch(err){
        return res.status(500).json({message: " error fetching data!!!"})
    }
})




//USER DASHBOARD API ENDS HERE-------------------------------------------------------------------------------------


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

