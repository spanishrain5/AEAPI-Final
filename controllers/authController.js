const jwt = require("jsonwebtoken"); //JWT tokens creation (sign())
const bcrypt = require("bcryptjs"); //password encryption

const config = require("../config/db.config.js");

exports.verifyToken = (req, res, next) => {
    
    // search token in headers most commonly used for authorization
    const header = req.headers['x-access-token'] || req.headers.authorization;

    if (typeof header == 'undefined')
        return res.status(401).json({ success: false, msg: "You must be authenticated to perform this request (undefined header)" });
    
    const bearer = header.split(' '); // Authorization: Bearer <token>
    const token = bearer[1];

    try {
        
        //console.log(token);

        let decoded = jwt.verify(token, config.SECRET);

        //console.log(decoded.usertype);

        req.loggedUserId = decoded.id; // save user ID and role into request object
        req.loggedUserType = decoded.usertype;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, msg: err || "You must be authenticated to perform this request" });
    }
};
    