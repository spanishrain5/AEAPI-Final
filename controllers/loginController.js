const jwt = require("jsonwebtoken"); //JWT tokens creation (sign())
const bcrypt = require("bcryptjs"); //password encryption

const config = require("../config/db.config.js");

const db = require("../models/index.js");
const Student = db.student;
const Facilitator = db.facilitator;
const Admin = db.admin;

const { ValidationError } = require('sequelize'); //necessary for model validations using sequelize

exports.login = async (req, res) => {
    try {
        if (!req.body || !req.body.email || !req.body.password) {
            return res.status(400).json({ success: false, msg: "Please provide email and password." });
        }
        else if (!req.body.usertype) {
            return res.status(400).json({ success: false, msg: "Please provide user type." });
        }
    
        if (req.body.usertype == 'student') {
            var user = await Student.findOne({ where: { email: req.body.email } });
        }
        else if (req.body.usertype == 'facilitator') {
            var user = await Facilitator.findOne({ where: { email: req.body.email } });
        }
        else if (req.body.usertype == 'admin') {
            var user = await Admin.findOne({ where: { email: req.body.email } });
        }
        else {
            return res.status(400).json({ success: false, msg: "Invalid user type" });
        }

        if (!user) {
            return res.status(404).json({ success: false, msg: "Account with that email does not exist" });
        }
     
        //console.log(user);

        // tests a string (password in body) against a hash (password in database)
        if (req.body.usertype != 'admin') {
            var check = bcrypt.compareSync( req.body.password, user.password );
        }
        else if (req.body.password === user.password) {
            check = 1;
        }
        
        if (!check) return res.status(401).json({ success:false, accessToken:null, msg:"Incorrect password" });
    
        // sign the given payload (user ID and role) into a JWT payload – builds JWT token, using secret key
        const token = jwt.sign({ id: user.id, usertype: req.body.usertype },
            config.SECRET, { expiresIn: '24h' });

        //console.log(user.id);

        return res.status(200).json({ success: true, accessToken: token, msg:"Logged in" });

    
    } catch (err) {
        if (err instanceof ValidationError)
            res.status(400).json({ success: false, msg: err.errors.map(e => e.message) });
        else
            res.status(500).json({ success: false, msg: err.message || "Something went wrong. Please try again later"});
    };
};