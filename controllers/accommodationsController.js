const db = require("../models/index.js");
const Accommodation = db.accommodation;
const Facilitator = db.facilitator;
const Amenity = db.amenity;

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
            success: false, msg: "You do not have permission to access this resource"
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

    console.log(req.loggedUserId)
    Accommodation.create(req.body) 
        .then(data => {
            //console.log(data)
            data.facilitator_id = req.loggedUserId;
            data.save()
            res.status(201).json({ success:true, msg:"Accommodation offer successfully created", URL:`/accommodations/${data.id}`});
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

        if (!isEmpty(req.query)) {

            var accommodationsQuery = "SELECT `accommodations`.`id`, `facilitator_id`, `validated`, `title`, `area`, `adress`, `room_type`, `number_of_beds`, `bed_type`, `max_guests`, `minimum_stay`, `rating`, `price` FROM `accommodations` AS `accommodations` LEFT OUTER JOIN `amenities` AS `amenities` ON `accommodations`.`id` = `amenities`.`accommodation_id`";
            var attributeCounter = 0;

            if (req.query.validated) {
                if (attributeCounter == 0) {
                    accommodationsQuery += ' WHERE'
                }
                else {
                    accommodationsQuery += ' AND'
                }
                accommodationsQuery += " `accommodations`.`validated` = '" + req.query.validated + "'";
                attributeCounter++;
            }
            if (req.query.area) {
                if (attributeCounter == 0) {
                    accommodationsQuery += ' WHERE'
                }
                else {
                    accommodationsQuery += ' AND'
                }
                accommodationsQuery += " `accommodations`.`area` = '" + req.query.area + "'";
                attributeCounter++;
            }
            if (req.query.room_type) {
                if (attributeCounter == 0) {
                    accommodationsQuery += ' WHERE'
                }
                else {
                    accommodationsQuery += ' AND'
                }
                accommodationsQuery += " `accommodations`.`room_type` = '" + req.query.room_type + "'";
                attributeCounter++;
            }
            if (req.query.number_of_beds) {
                if (attributeCounter == 0) {
                    accommodationsQuery += ' WHERE'
                }
                else {
                    accommodationsQuery += ' AND'
                }
                accommodationsQuery += " `accommodations`.`number_of_beds` = '" + req.query.number_of_beds + "'";
                attributeCounter++;
            }
            if (req.query.bed_type) {
                if (attributeCounter == 0) {
                    accommodationsQuery += ' WHERE'
                }
                else {
                    accommodationsQuery += ' AND'
                }
                accommodationsQuery += " `accommodations`.`bed_type` = '" + req.query.bed_type + "'";
                attributeCounter++;
            }

            var accommodations = await db.sequelize.query(accommodationsQuery, { type: QueryTypes.SELECT });
             
        }
        else {
            var accommodations = await Accommodation.findAll({ 
                attributes: ['id', 'facilitator_id', 'validated', 'title', 'area', 'adress', 'room_type', 'number_of_beds', 'bed_type', 
                'max_guests', 'minimum_stay', 'rating', 'price'],
                include: [{
                    model: Amenity,
                    attributes: ['amenity']
                }]
            })
        }
        // do not expose users' sensitive data
        
        res.status(200).json({ success: true, accommodations: accommodations });
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
        /*
        let amenities = await Amenity.findAll({
            where: {
                accommodation_id: req.params.id
            },
            attributes: ['amenity'],
            raw: true
        })
        */

        let accommodations = await Accommodation.findAll({ 
            where: {
                id: req.params.id  
            },
            attributes: ['id', 'facilitator_id', 'validated', 'title', 'area', 'adress', 'room_type', 'number_of_beds', 'bed_type', 
            'max_guests', 'minimum_stay', 'rating', 'price'], 
            include: [{
                model: Amenity,
                attributes: ['amenity']
            }]
        })
        if (accommodations == '') {
            res.status(404).json({
                success: false, msg: "Accommodation not found"
            })
        } else {
           // accommodations = accommodations + amenities;
           res.status(200).json({ success: true, accommodations: accommodations }); 
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

        var listing = await Accommodation.findOne({ where: { id: req.params.id } });

        if (!listing) {
            res.status(404).json({
                success: false, msg: "Accommodation not found"
            })
        } else if (req.loggedUserType !== "admin" && (req.loggedUserType != "facilitator" || req.loggedUserId != listing.facilitator_id)) {
            return res.status(403).json({
                success: false, msg: "You do not have permission to access this resource (delete)"
            });   
        } else {
            listing.destroy();
            res.status(200).json({ success: true, msg: "Accommodation successfully removed" });
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
        
        var listing = await Accommodation.findOne({ where: { id: req.params.id } });

        if (!listing) {
            res.status(404).json({
                success: false, msg: "User not found"
            })
        } else {
            listing.update ({
                validated: true
            });
            res.status(200).json({ success: true, msg: "Accommodation validated successfully." }); 
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
        var listing = await Accommodation.findOne({ where: { id: req.params.id } });

        if (!listing) {
            res.status(404).json({
                success: false, msg: "Accommodation not found"
            })
        } else if (req.loggedUserType !== "admin" && (req.loggedUserType != "facilitator" || req.loggedUserId != listing.facilitator_id)) {
            return res.status(403).json({
                success: false, msg: "You do not have permission to access this resource"
            });   
        } else if (!req.body) {
            return res.status(400).json({
                success: false, msg: "Please edit at least one parameter"
            });
        } else if (!isEmpty(req.body.validated)) {
            return res.status(403).json({
                success: false, msg: "You do not have permission to access this resource (only admin can validate accommodation)"
            });
        } else {
            listing.update (req.body)
                .then(data => {
                    res.status(201).json({ success:true, msg:"Accommodation offer successfully updated" });
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

