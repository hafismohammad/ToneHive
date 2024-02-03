const express = require("express");
const mongoose = require("mongoose")
const path = require("path")
const nocache = require("nocache");
const flash = require('express-flash')
const nodemailer = require("nodemailer")
const session = require("express-session")
const MongoDBStore = require('connect-mongodb-session')(session);

// Mongodb connections
mongoose.connect("mongodb://localhost:27017/ToneHiveDBS")
mongoose.connection.on("connected", (req, res) => {
    console.log("Connected to mongodb");
})

// Create a MongoDB session store
const store = new MongoDBStore({
  uri: "mongodb://localhost:27017/ToneHiveDBS",
  collection: 'sessions', // the collection where sessions will be stored
  expires: 1000 * 60 * 60 * 24 * 7, // session expiration time (7 days)
});

// Catch errors
store.on('error', function (error) {
  console.log(error);
});


// Import routes
const userRoute = require("./routes/userRoutes");
const adminRute = require("./routes/adminRoutes")



const app = express();



// View engine and publuc setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "/public")));
app.use("/assets", express.static(path.join(__dirname, "/public/assets")));
// app.use("/admin-assets", express.static(path.join(__dirname, "/public/admin-assets")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const PORT = 3000


app.use(
    session({
      secret: "1231fdsdfssg33435",
      resave: false,
      saveUninitialized: true,
      store: store,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }, // cookie expiration time (7 days)
    })
  );



// Set up session middleware
app.use(session({
  secret: 'your-secret-key', // Change this to a secret key
  resave: false,
  saveUninitialized: false
}));

// Set up flash middleware
app.use(flash());

// Example route to set a flash message
app.use( (req, res,next) => {
  res.locals.message=req.session.message;
  delete req.session.message;
  next();
});

// User routes
app.use(nocache())
app.use("/", userRoute);   
app.use('/admin', adminRute)  
//app.use("/adminhome", adminRute)                             



app.listen(PORT, () => console.log(`Server is running on the port ${PORT} just click here http://localhost:3000`))