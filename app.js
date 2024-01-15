const express = require("express");
const mongoose = require("mongoose")
const path = require("path")
const nocache = require("nocache");
const session = require("express-session")

// Mongodb connections
mongoose.connect("mongodb://localhost:27017/ToneHiveDBS")
mongoose.connection.on("connected", (req, res) => {
    console.log("Connected to mongodb");
})
// Import routes
const userRoute = require("./routes/userRoutes");



const app = express();



// View engine and publuc setup
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "/public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const PORT = 3000


app.use(
    session({
      secret: "1231fdsdfssg33435",
      resave: false,
      saveUninitialized: true,
    })
  );

app.use(nocache())

// User routes
app.use("/", userRoute);                                  



app.listen(PORT, () => console.log(`Server is running on the port ${PORT} just click here http://localhost:3000`))