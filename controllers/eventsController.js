const db = require("../models/index.js");
const Event = db.event;
const Facilitator = db.facilitator;

const { ValidationError } = require('sequelize'); //necessary for model validations using sequelize
const { QueryTypes } = require('sequelize');

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
    
    if (req.loggedUserType !== "facilitator") {
        return res.status(403).json({
            success: false, msg: "You do not have permission to access this resource (create)"
        });
    }

    let facilitator = await Facilitator.findAll({
        where: {
            id: req.loggedUserId
        },
        attributes: ['validated'],
        raw: true
    })

    //console.log(facilitator);

    if (!facilitator[0].validated) {
        return res.status(403).json({
            success: false, msg: "You do not have permission to access this resource (account not validated)"
        });
    }
    
    Event.create(req.body)
     
        .then(data => {
            data.facilitator_id = req.loggedUserId;
            data.save()
            res.status(201).json({ success:true, msg:"New event created", URL:`/events/${data.id}`});
        })
        .catch(err => {
            if (err instanceof ValidationError) 
                res.status(400).json({ success:false, msg: err.errors.map(e => e.message) });
            else
                res.status(500).json({
                    message: err.message || "Some error occurred while creating the entry."
                });
        });
};

exports.findAll = async (req, res) => {
    try {

        if (!isEmpty(req.query)) {

            var eventsQuery = "SELECT `id`, `facilitator_id`, `validated`, `title`, `area`, `address`, `event_type`, `date`, `description` FROM `events` AS `events`";
            var attributeCounter = 0;

            if (req.query.validated) {
                if (attributeCounter == 0) {
                    eventsQuery += ' WHERE'
                }
                else {
                    eventsQuery += ' AND'
                }
                eventsQuery += " `events`.`validated` = '" + req.query.validated + "'";
                attributeCounter++;
            }
            if (req.query.area) {
                if (attributeCounter == 0) {
                    eventsQuery += ' WHERE'
                }
                else {
                    eventsQuery += ' AND'
                }
                eventsQuery += " `events`.`area` = '" + req.query.area + "'";
                attributeCounter++;
            }
            if (req.query.event_type) {
                if (attributeCounter == 0) {
                    eventsQuery += ' WHERE'
                }
                else {
                    eventsQuery += ' AND'
                }
                eventsQuery += " `events`.`event_type` = '" + req.query.event_type + "'";
                attributeCounter++;
            }
            if (req.query.date) {
                if (attributeCounter == 0) {
                    eventsQuery += ' WHERE'
                }
                else {
                    eventsQuery += ' AND'
                }
                eventsQuery += " `events`.`date` = '" + req.query.date + "'";
                attributeCounter++;
            }
            
            var events = await db.sequelize.query(eventsQuery, { type: QueryTypes.SELECT });
        }
        else {
            var events = await Event.findAll({ 
                attributes: ['id', 'facilitator_id', 'validated', 'title', 'area', 'address', 'event_type', 'date', 'description'] 
            })
        }
        // do not expose users' sensitive data
        
    
        res.status(200).json({ success: true, events: events });
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Something went wrong. Please try again later."
        });
    };
};

exports.findOne = async (req, res) => {
    try {
        //0 do not expose users' sensitive data
        let events = await Event.findAll({ 
            where: {
                id: req.params.id  
            },
            attributes: ['id', 'facilitator_id', 'validated', 'title', 'area', 'address', 'event_type', 'date', 'description'] 
        })
        if (events == '') {
            res.status(404).json({
                success: false, msg: "Event not found"
            })
        } else {
           res.status(200).json({ success: true, events: events }); 
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

        var listing = await Event.findOne({ where: { id: req.params.id } });

        if (!listing) {
            res.status(404).json({
                success: false, msg: "Event not found"
            })
        } else if (req.loggedUserType !== "admin" && (req.loggedUserType != "facilitator" || req.loggedUserId != listing.facilitator_id)) {
            return res.status(403).json({
                success: false, msg: "You do not have permission to access this resource (delete)"
            });   
        } else {
            listing.destroy();
            res.status(200).json({ success: true, msg: "Event successfully removed" });
        }
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Something went wrong. Please try again later"
        });
    };
}

exports.validate = async (req, res) => {
    try {
        if (req.loggedUserType !== "admin") {
            return res.status(403).json({
                success: false, msg: "You do not have permission to access this resource"
            });
        }
        // do not expose users' sensitive data
        
        var listing = await Event.findOne({ where: { id: req.params.id } });

        if (!listing) {
            res.status(404).json({
                success: false, msg: "Event not found"
            })
        } else {
            listing.update ({
                validated: true
            });
            res.status(200).json({ success: true, msg: "Event validated successfully." }); 
        }
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Something went wrong. Please try again later"
        });
    };
}

exports.update = async (req, res) => {
    try {
        var listing = await Event.findOne({ where: { id: req.params.id } });

        if (!listing) {
            res.status(404).json({
                success: false, msg: "Event not found"
            })
        } else if (req.loggedUserType !== "admin" && (req.loggedUserType != "facilitator" || req.loggedUserId != listing.facilitator_id)) {
            return res.status(403).json({
                success: false, msg: "You do not have permission to access this resource"
            });   
        } else if (!req.body) {
            return res.status(400).json({
                success: false, msg: "Please edit at least one parameter"
            });
        } else {
            listing.update (req.body)
                .then(data => {
                    res.status(201).json({ success:true, msg:"Event successfully updated"});
                })
                .catch(err => {
                    if (err instanceof ValidationError) 
                        res.status(400).json({ success:false, msg: err.errors.map(e => e.message) });
                    else
                        res.status(500).json({
                            message: err.message || "Something went wrong. Please try again later"
                        });
                });
        }
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Something went wrong. Please try again later"
        });
    };
}

