const express = require('express');
const bcrypt = require('bcrypt');
const collection = require("./config");

const app = express();
// convert data into json format
app.use(express.json());

app.use(express.urlencoded({ extended: false }));

// use EJS as the view engine
app.set('view engine', 'ejs');
// static file
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

// Register User
app.post("/signup", async (req, res) => {
    const data = {
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        repeatPassword: req.body.repeatPassword,
        dob: req.body.dob,
        gender: req.body.gender
    }

    // check if the user already exist in the database
    const existingUser = await collection.findOne({ name: data.name });
    if (existingUser) {
        res.send("User already exists. Please choose a diffrent username");
    } else {
        // hash the password using bcrypt
        const saltRounds = 10; //Number of salt round for bcrypt
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        data.password = hashedPassword; //Replace the hash password with original password

        const userdata = await collection.insertMany(data);
        res.render("home");
    }
});

// Login user
app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.username });
        if (!check) {
            res.send("user name cannot be found");
        }

        //compare the hash password from the database with the plain text
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (isPasswordMatch) {
            res.render("home");
        } else {
            req.send("wrong password");
        }
    } catch {
        res.send("wrong Details");
    }
});


const port = 5000;

app.listen(port, () => {
    console.log(`server running on port: ${port}`);
})