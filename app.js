const express = require("express");
const mongoose = require("mongoose")
const path = require("path")
const nocache = require("nocache");
var createError = require('http-errors');
const flash = require('express-flash')
const nodemailer = require("nodemailer")
const session = require("express-session")
const MongoDBStore = require('connect-mongodb-session')(session);
require('dotenv').config();

// Mongodb connections
mongoose.connect(process.env.MONGODB_URI).then(()=>{
  console.log("Connected to MongoDB");
})
// mongoose.connection.on("connected", () => {
//     console.log("Connected to MongoDB");
// });


// Create a MongoDB session store
const store = new MongoDBStore({
  uri: `${process.env.MONGODB_URI}/ToneHiveDBS`,
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

const PORT = 3001


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
app.use('/admin', adminRute)  
app.use("/", userRoute);   

// Middleware for handling 404 errors
app.use((req, res, next) => {
  res.status(404).render('user/page-404', { user: req.session.user });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Log the error
  console.error(err.stack);
  // Render a generic error page
  res.status(500).send('Something broke!');
})

app.listen(PORT, () => console.log(`Server is running on the port ${PORT} just click here http://localhost:3000`))