const bcrypt = require("bcryptjs"); //password encryption

const db = require("../models/index.js");
const Student = db.student;

const { ValidationError } = require('sequelize'); //necessary for model validations using sequelize

exports.create = (req, res) => {
    
    const passwordToValidate = req.body.password;
    const passwordRegexp = /^(?=.*\d)(?=.*[!@#$%^&*_.])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordRegexp.test(passwordToValidate)) {
        return res.status(400).json({ error: "Invalid password - needs to be at least 8 characters long and include at least one number, special character and uppercase letter." });
    };

    Student.create({
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        first_name: req.body.first_name,
        last_name: req.body.last_name
    }) 
        .then(data => {
            res.status(201).json({ success:true, msg:"Account created", URL:`/students/${data.id}`});
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
                success: false, msg: "You do not have permission to access this resource"
            });
        }
        // do not expose users' sensitive data
        let students = await Student.findAll({ 
            attributes: ['id', 'email', 'first_name', 'last_name'] 
        })
        res.status(200).json({ success: true, students: students });
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Something went wrong. Please try again later."
        });
    };
};

exports.findOne = async (req, res) => {
    try {
        if (req.loggedUserRole !== "admin" && (req.loggedUserType != "student" || req.loggedUserId != req.params.id)) {
            return res.status(403).json({
                success: false, msg: "You do not have permission to access this resource"
            });
        }
        // do not expose users' sensitive data
        let students = await Student.findAll({ 
            where: {
                id: req.params.id  
            },
            attributes: ['id', 'email', 'first_name', 'last_name'] 
        })
        if (students == '') {
            res.status(404).json({
                success: false, msg: "This user does not exist"
            })
        } else {
           res.status(200).json({ success: true, students: students }); 
        }
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Something went wrong. Please try again later."
        });
    };
};

exports.delete = async (req, res) => {
    try {

        //console.log(req.loggedUserType);

        if (req.loggedUserType !== "admin" && (req.loggedUserType != "student" || req.loggedUserId != req.params.id)) {
            return res.status(403).json({
                success: false, msg: "You do not have permission to access this resource (delete)"
            });
        }
        // do not expose users' sensitive data
        
        var user = await Student.findOne({ where: { id: req.params.id } });

        if (!user) {
            res.status(404).json({
                success: false, msg: "User not found"
            })
        } else {
            user.destroy();
            res.status(204).json({ success: true, msg: "Account successfully removed" }); 
        }
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Something went wrong. Please try again later"
        });
    };
}


