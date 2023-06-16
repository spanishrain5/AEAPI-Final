const db = require("../models/index.js");
const Booking = db.booking;
const Accommodation = db.accommodation;
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

    if (!Accommodation.findAll({ 
            where: {
                id: req.body.accommodation_id  
            }
        })) {
            return res.status(404).json({
                success: false, msg: "Accommodation not found"
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

        let accommodation = await Accommodation.findAll({
            where: {
                id: req.body.accommodation_id
            },
            attributes: ['validated'],
            raw: true
        })
    
        //console.log(facilitator);
    
        if (!accommodation[0].validated) {
            return res.status(403).json({
                success: false, msg: "You do not have permission to access this resource (accommodation not validated)"
            });
        }
    

    if (console.log(Booking.findAll({ 
            where: {
                student_id: req.loggedUserId,
                accommodation_id: req.body.accommodation_id,
                booking_start: req.body.booking_start,
                booking_end: req.body.booking_end,
                num_of_people: req.body.num_of_people
            }
        }))) {
            return res.status(400).json({
                success: false, msg: "This booking already exists"
            }); 
        }

    Booking.create({
        booking_start: req.body.booking_start,
        booking_end: req.body.booking_end,
        num_of_people: req.body.num_of_people
    })
        .then(data => {
            data.student_id = req.loggedUserId;
            data.accommodation_id = req.body.accommodation_id;
            data.save()
            res.status(201).json({ success:true, msg:"Booking successfully created.", URL:`/bookings/${data.id}`});
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

        if (isEmpty(req.query) && req.loggedUserType !== "admin") {
            return res.status(403).json({
                success: false, msg: "You do not have permission to access this resource (find all as admin)"
            });
        }
        else if (isEmpty(req.query) && req.loggedUserType === "admin") {
            var bookings = await Booking.findAll();
            /*
            if (isEmpty(bookings)) {
                res.status(404).json({
                    success: false, msg: "Booking not found"
                })
            }
            res.status(200).json({ success: true, bookings: bookings});
            */
        }
        else if (!isEmpty(req.query) && req.loggedUserType === "admin"){
            if (!req.query.accommodation_id) {
                return res.status(400).json({
                    success: false, msg: "Please provide accommodation ID in query parameters"
                });
            }
            var bookings = await Booking.findAll({ 
                where: {
                    accommodation_id: req.query.accommodation_id  
                },
            });
            /*
            if (isEmpty(bookings)) {
                res.status(404).json({
                    success: false, msg: "Booking not found"
                })
            }
            res.status(200).json({ success: true, bookings: bookings});
            */
        }
        else if (!isEmpty(req.query) && req.loggedUserType === "facilitator") {
            if (!req.query.accommodation_id) {
                return res.status(400).json({
                    success: false, msg: "Please provide accommodation ID in query parameters"
                });
            }

            let accommodationOfBooking = await Accommodation.findAll({
                where: {
                    id: req.query.accommodation_id
                },
                attributes: ['facilitator_id'],
                raw: true
            })

            //console.log(req.loggedUserId);
            //console.log(accommodationOfBooking[0].facilitator_id);

            if (accommodationOfBooking[0].facilitator_id != req.loggedUserId) {
                return res.status(403).json({
                    success: false, msg: "You do not have permission to access this resource (wrong facilitator ID)"
                });
            }

            var bookings = await Booking.findAll({
                where: {
                    accommodation_id: req.query.accommodation_id
                }
            });
            
        }
        else {
            return res.status(403).json({
                success: false, msg: "You do not have permission to access this resource (not facilitator)"
            });
        }

        if (isEmpty(bookings)) {
            return res.status(404).json({
                success: false, msg: "Booking not found"
            })
        }

        return res.status(200).json({ success: true, bookings: bookings});
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Something went wrong. Please try again later."
        });
    };
};

exports.findOne = async (req, res) => {
    try {

        if (req.loggedUserType != 'admin' && req.loggedUserType != 'facilitator') {
            return res.status(403).json({
                success: false, msg: "You do not have permission to access this resource (not facilitator)"
            });
        } 
        else if (req.loggedUserType == 'admin') {
            var bookings = await Booking.findAll({ 
                where: {
                    id: req.params.id  
                },
                ///attributes: ['id', 'facilitator_id', 'validated', 'title', 'area', 'address', 'event_type', 'date', 'description'] 
            })
        } else {

            let bookingToFind = await Booking.findAll({ 
                where: {
                    id: req.params.id  
                },
                attributes: ['accommodation_id'],
                raw: true 
            })

            if (isEmpty(bookingToFind)) {
                return res.status(404).json({
                    success: false, msg: "Booking not found"
                })
            }

            let accommodationOfBooking = await Accommodation.findAll({
                where: {
                    id: bookingToFind[0].accommodation_id
                },
                attributes: ['facilitator_id'],
                raw: true
            })

            //console.log(req.loggedUserId);
            //console.log(accommodationOfBooking[0].facilitator_id);

            if (accommodationOfBooking[0].facilitator_id != req.loggedUserId) {
                return res.status(403).json({
                    success: false, msg: "You do not have permission to access this resource (wrong facilitator ID)"
                });
            }

            var bookings = await Booking.findAll({ 
                where: {
                    id: req.params.id  
                },
                ///attributes: ['id', 'facilitator_id', 'validated', 'title', 'area', 'address', 'event_type', 'date', 'description'] 
            })
        }

        //0 do not expose users' sensitive data
        
        if (isEmpty(bookings)) {
            return res.status(404).json({
                success: false, msg: "Booking not found"
            })
        } else {
           res.status(200).json({ success: true, bookings: bookings }); 
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

        var booking = await Booking.findOne({ where: { id: req.params.id } });

        if (isEmpty(booking)) {
            res.status(404).json({
                success: false, msg: "Booking not found"
            })
        } else {
            
            let accommodationOfBooking = await Accommodation.findAll({
                where: {
                    id: booking.accommodation_id
                },
                attributes: ['facilitator_id'],
                raw: true
            })

            if (req.loggedUserType !== "admin" && (req.loggedUserType != "facilitator" || req.loggedUserId != accommodationOfBooking[0].facilitator_id)) {
                return res.status(403).json({
                    success: false, msg: "You do not have permission to access this resource (delete)"
                });
            }   
        }

        booking.destroy();
        res.status(200).json({ success: true, msg: "Booking successfully removed" });
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Something went wrong. Please try again later"
        });
    };
}

exports.validate = async (req, res) => {
    try {
        var booking = await Booking.findOne({ where: { id: req.params.id } });

        if (isEmpty(booking)) {
            res.status(404).json({
                success: false, msg: "Booking not found"
            })
        } else {
            
            let accommodationOfBooking = await Accommodation.findAll({
                where: {
                    id: booking.accommodation_id
                },
                attributes: ['facilitator_id'],
                raw: true
            })

            if (req.loggedUserType != "admin" && (req.loggedUserType != "facilitator" || req.loggedUserId != accommodationOfBooking[0].facilitator_id)) {
                return res.status(403).json({
                    success: false, msg: "You do not have permission to access this resource (validate)"
                });
            }   
        }

        booking.update ({
            validated: true
        });
        res.status(200).json({ success: true, msg: "Booking validated successfully." }); 
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Something went wrong. Please try again later"
        });
    };
}