const db = require("../models/index.js");
const InterestedUser= db.interestedUser;
const Event = db.event;
const Student = db.student;

const { ValidationError } = require('sequelize'); //necessary for model validations using sequelize

function isEmpty(obj) {
    // null and undefined are "empty"
    if (obj == null) return true;
 
    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length && obj.length > 0)    return false;
    if (obj.length === 0)  return true;
 
    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and toValue enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }
 
    return true;
}

exports.create = async (req, res) => {
    if (req.loggedUserType !== "student") {
        return res.status(403).json({
            success: false, msg: "You do not have permission to access this resource (create)"
        });
    }

    if (!Event.findAll({ 
            where: {
                id: req.params.id  
            }
        })) {
            return res.status(404).json({
                success: false, msg: "Event not found"
            }); 
        }

        let event = await Event.findAll({
            where: {
                id: req.params.id
            },
            attributes: ['validated'],
            raw: true
        })
    
        //console.log(facilitator);
    
        if (!event[0].validated) {
            return res.status(403).json({
                success: false, msg: "You do not have permission to access this resource (event not validated)"
            });
        }

    if (!Student.findAll({ 
            where: {
                id: req.loggedUserId  
            }
        })) {
            return res.status(404).json({
                success: false, msg: "User not found"
            }); 
        }

    if (!isEmpty(InterestedUser.findAll({ 
            where: {
                student_id: req.loggedUserId,
                event_id: req.params.id,
            }
        }))) {
            return res.status(400).json({
                success: false, msg: "User already interested in this event"
            }); 
        }

    

    InterestedUser.create({})
        .then(data => {
            data.student_id = req.loggedUserId;
            data.event_id = req.params.id;
            data.save()
            res.status(201).json({ success:true, msg:"Interest manifested successfully", URL:`/events/${data.event_id}/interested/${data.id}`});
        })
        .catch(err => {
            if (err instanceof ValidationError)
                res.status(400).json({ success:false, msg: err.errors.map(e => e.message) });
            else
                res.status(500).json({
                    message: err.message || "Something went wrong. Please try again later."
                });
        });
};

exports.findAll = async (req, res) => {

    try {
        // do not expose users' sensitive data
        var interestedUsers = await InterestedUser.findAll({
            where: {
                event_id: req.params.id  
            }
        });
        
        if (isEmpty(interestedUsers)) {
            return res.status(404).json({
                success: false, msg: "No interested users"
            })
        }

        return res.status(200).json({ success: true, interestedUsers: interestedUsers});
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Something went wrong. Please try again later."
        });
    };
};

exports.findOne = async (req, res) => {
    try {
        let interestedUsers = await InterestedUser.findAll({ 
            where: {
                id: req.params.user_id  
            },
            ///attributes: ['id', 'facilitator_id', 'validated', 'title', 'area', 'address', 'event_type', 'date', 'description'] 
        })

        if (isEmpty(interestedUsers)) {
            return res.status(404).json({
                success: false, msg: "Interested user not found"
            })
        } else {
           res.status(200).json({ success: true, interestedUsers: interestedUsers }); 
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

        var interestedUser = await InterestedUser.findOne({ where: { id: req.params.user_id } });

        if (isEmpty(interestedUser)) {
            res.status(404).json({
                success: false, msg: "Interested user not found"
            })
        } else {
            
            if (req.loggedUserType !== "admin" && (req.loggedUserType != "student" || req.loggedUserId != interestedUser.student_id)) {
                return res.status(403).json({
                    success: false, msg: "You do not have permission to access this resource (delete)"
                });
            }   
        }

        interestedUser.destroy();
        res.status(200).json({ success: true, msg: "Interested user successfully removed" });
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Something went wrong. Please try again later"
        });
    };
}