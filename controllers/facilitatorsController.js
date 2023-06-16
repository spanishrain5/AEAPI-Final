const jwt = require("jsonwebtoken"); //JWT tokens creation (sign())
const bcrypt = require("bcryptjs"); //password encryption

const db = require("../models/index.js");
const Facilitator = db.facilitator;

const { ValidationError } = require('sequelize'); //necessary for model validations using sequelize



exports.create = (req, res) => {
    
    const passwordToValidate = req.body.password;
    const passwordRegexp = /^(?=.*\d)(?=.*[!@#$%^&*_.])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordRegexp.test(passwordToValidate)) {
        return res.status(400).json({ error: "Invalid password - needs to be at least 8 characters long and include at least one number, special character and uppercase letter." });
    };
    
    Facilitator.create({
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        phone: req.body.phone,
    })
        .then(data => {
            res.status(201).json({ success:true, msg:"Account created", URL:`/facilitators/${data.id}`});
        })
        .catch(err => {
            if (err instanceof ValidationError) 
                res.status(400).json({ success:false, msg: err.errors.map(e => e.message) });
            else
                res.status(500).json({
                    message: err.message || "Something went wrong. Please try again later"
                });
        });
};

exports.findAll = async (req, res) => {
    try {
        if (req.loggedUserType !== "admin") {
            return res.status(403).json({
                success: false, msg: "You do not have permission to access this resource (findAll)"
            });
        }
        // do not expose users' sensitive data
        let facilitators = await Facilitator.findAll({ 
            attributes: ['id', 'email', 'first_name', 'last_name', 'phone', 'validated'] 
        })
        res.status(200).json({ success: true, facilitators: facilitators });
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Something went wrong. Please try again later"
        });
    };
};

exports.findOne = async (req, res) => {
    try {
        if (req.loggedUserType !== "admin" && (req.loggedUserType != "facilitator" || req.loggedUserId != req.params.id)) {
            return res.status(403).json({
                success: false, msg: "You do not have permission to access this resource (findOne)"
            });
        }
        // do not expose users' sensitive data
        let facilitators = await Facilitator.findAll({ 
            where: {
                id: req.params.id  
            },
            attributes: ['id', 'email', 'first_name', 'last_name', 'phone', 'validated'] 
        })
        if (facilitators == '') {
            res.status(404).json({
                success: false, msg: "This account does not exist"
            })
        } else {
           res.status(200).json({ success: true, facilitators: facilitators }); 
        }
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Some error occurred while retrieving users."
        });
    };
};

exports.validate = async (req, res) => {
    try {
        if (req.loggedUserType !== "admin") {
            return res.status(403).json({
                success: false, msg: "You do not have permission to access this resource"
            });
        }
        // do not expose users' sensitive data
        
        var user = await Facilitator.findOne({ where: { id: req.params.id } });

        if (!user) {
            res.status(404).json({
                success: false, msg: "User not found"
            })
        } else {
            user.update ({
                validated: true
            });
            res.status(200).json({ success: true, msg: "Account validated successfully." }); 
        }
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Something went wrong. Please try again later"
        });
    };
}

exports.delete = async (req, res) => {
    try {

        //console.log(req.loggedUserType);

        if (req.loggedUserType !== "admin" && (req.loggedUserType != "facilitator" || req.loggedUserId != req.params.id)) {
            return res.status(403).json({
                success: false, msg: "You do not have permission to access this resource (delete)"
            });
        }
        // do not expose users' sensitive data
        
        var user = await Facilitator.findOne({ where: { id: req.params.id } });

        if (!user) {
            res.status(404).json({
                success: false, msg: "User not found"
            })
        } else {
            user.destroy();
            res.status(200).json({ success: true, msg: "Account successfully removed" }); 
        }
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Something went wrong. Please try again later"
        });
    };
}

/*
// import data
const facilitators = require("../models/facilitatorsModel");

// exports custom request payload validation middleware
exports.bodyValidator = (req, res, next) => {
    
    //404 - not found, 400 - bad request

    if (!req.body.email) {
        return res.status(400).json({ error: "Please provide email" });
    }
    else {
        const emailToValidate = req.body.email;
        const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegexp.test(emailToValidate)) {
            return res.status(400).json({ error: "Invalid email" });
        }; 
    }

    if (!req.body.password) {
        return res.status(400).json({ error: "Please create password" });
    }
    else {
        const passwordToValidate = req.body.password;
        const passwordRegexp = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        if (!passwordRegexp.test(passwordToValidate)) {
            return res.status(400).json({ error: "Invalid password - needs to be at least 8 characters long and include at least one number, special character and uppercase letter." });
        };
    }

    if (!req.body.first_name) {
        return res.status(400).json({ error: "Please provide first name" });
    }
    else {
        const firstNameToValidate = req.body.first_name;
        const firstNameRegexp = /^[A-Z]+[a-z]+$/;
        if (!firstNameRegexp.test(firstNameToValidate)) {
            return res.status(400).json({ error: "Invalid first name." });
        };
    }

    if (!req.body.last_name) {
        return res.status(400).json({ error: "Please provide last name" });
    }
    else {
        const lastNameToValidate = req.body.last_name;
        const lastNameRegexp = /^[A-Z]+[a-z]+$/;
        if (!lastNameRegexp.test(lastNameToValidate)) {
            return res.status(400).json({ error: "Invalid last name." });
        };
    }

    if (!req.body.phone) {
        return res.status(400).json({ error: "Please provide phone number" });
    }
    else {
        const phoneToValidate = req.body.phone;
        const phoneRegexp = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        if (!phoneRegexp.test(phoneToValidate)) {
            return res.status(400).json({ error: "Invalid phone number." });
        };
    }
    
    next();
};


// Display all
exports.findAll = (req, res) => {
    res.json(facilitators);
};


// Create new facilitator account (register)
exports.create = (req, res) => {
    if (facilitators.length > 0) {
        var lastEntryIndex = facilitators.length - 1;
        var newEntryId = facilitators[lastEntryIndex].id + 1;
    }
    else { var newEntryId = 1; }
    let newEntry = {id: newEntryId, email: req.body.email, password: req.body.password, 
                    first_name: req.body.first_name, last_name: req.body.last_name, phone: req.body.phone, validated: false};
    if (facilitators.push(newEntry)) {
        res.status(200).json({ message: "facilitator entry with ID " + newEntryId + " created" });
    }
    else res.status(500).json({ error: "Something went wrong" });
    
};


// Delete existing facilitator account
exports.delete = (req, res) => {
    var requestedId = req.params.id;
    for (var i = 0; i < facilitators.length; i++) {
        if (facilitators[i].id == requestedId) {
            if (facilitators.splice(i, 1)) {
                return res.status(204).json({ message: "Facilitator entry with ID " + requestedId + " deleted" });
            }
            else return res.status(500).json({ error: "Something went wrong"}); 
        }
    }
    return res.status(404).json({ error: "No such facilitator exists."});
};




// Validate new facilitator account
exports.validate = (req, res) => {
    var requestedId = req.params.id;
    var updatedName = req.body.name;
    var updatedYear = req.body.year;
    var updatedRating = req.body.rating;
    
    for (var i = 0; i < movies.length; i++) {
        if (movies[i].id == requestedId) {
            if ((movies[i].name = updatedName) && (movies[i].year = updatedYear) && (movies[i].rating = updatedRating)) {
                res.status(200).json({ message: "Movie entry with ID " + requestedId + " changed" });
            }
            else res.status(500).json({ error: "Something went wrong"}); 
        }
    }
    res.status(404).json({ error: "No such movie exists."});
};
*/
