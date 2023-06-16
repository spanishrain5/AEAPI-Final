const db = require("../models/index.js");
const Review = db.review;
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
                id: req.params.id  
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
                id: req.params.id
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
    

    let accommodationToUpdate = await Accommodation.findAll({ 
        where: {
            id: req.params.id  
        },
        raw: true
    });
    var accommodationReviews = await Review.findAll({
        where: {
            accommodation_id: req.params.id 
        },
        raw: true
    })

    //console.log(accommodationToUpdate[0].rating);
    //console.log(req.body.rating);
    //console.log(accommodationReviews.length);

    const newRating = (+accommodationToUpdate[0].rating + +req.body.rating) / (+accommodationReviews.length + 1)
    /*
    accommodationToUpdate.rating = newRating;
       //saving the changes
    accommodationToUpdate.save({fields: ['rating']});
    */
    
    await Accommodation.update({
        rating: newRating
    }, {
        where: {
            id: req.params.id
        }
    }); 
        
    Review.create({
        rating: req.body.rating,
        review_text: req.body.review_text
    })
        .then(data => {
            data.student_id = req.loggedUserId;
            data.accommodation_id = req.params.id;
            data.save()

            

            res.status(201).json({ success:true, msg:"Review successfully submitted.", URL:`/accommodations/${data.accommodation_id}/reviews/${data.id}`});
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

        if (isEmpty(req.query)) {
            var reviews = await Review.findAll();
        }
        else {
            if (!req.query.accommodation_id) {
                return res.status(400).json({
                    success: false, msg: "Please provide accommodation ID in query parameters"
                });
            }
            var reviews = await Review.findAll({ 
                where: {
                    accommodation_id: req.query.accommodation_id  
                },
            });
        }

        if (isEmpty(reviews)) {
            return res.status(404).json({
                success: false, msg: "No reviews found"
            })
        }

        return res.status(200).json({ success: true, reviews: reviews});
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Something went wrong. Please try again later."
        });
    };
};

exports.findOne = async (req, res) => {
    try {

        let reviews = await Review.findAll({ 
            where: {
                id: req.params.review_id  
            },
            ///attributes: ['id', 'facilitator_id', 'validated', 'title', 'area', 'address', 'event_type', 'date', 'description'] 
        })

        if (isEmpty(reviews)) {
            return res.status(404).json({
                success: false, msg: "Review not found"
            })
        } else {
           res.status(200).json({ success: true, reviews: reviews }); 
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

        var review = await Review.findOne({ where: { id: req.params.review_id } });

        if (isEmpty(review)) {
            res.status(404).json({
                success: false, msg: "Review not found"
            })
        } else {
            
            if (req.loggedUserType !== "admin" && (req.loggedUserType != "student" || req.loggedUserId != review.student_id)) {
                return res.status(403).json({
                    success: false, msg: "You do not have permission to access this resource (delete)"
                });
            }   
        }

        let accommodationToUpdate = await Accommodation.findAll({ 
            where: {
                id: req.params.id  
            },
            raw: true
        });
        var accommodationReviews = await Review.findAll({
            where: {
                accommodation_id: req.params.id 
            },
            raw: true
        })
    
        //console.log(accommodationToUpdate[0].rating);
        //console.log(req.body.rating);
        //console.log(accommodationReviews.length);
    
        const newRating = (accommodationToUpdate[0].rating * accommodationReviews.length - review.rating) / (accommodationReviews.length - 1)
        /*
        accommodationToUpdate.rating = newRating;
           //saving the changes
        accommodationToUpdate.save({fields: ['rating']});
        */
        
        await Accommodation.update({
            rating: newRating
        }, {
            where: {
                id: req.params.id
            }
        });

        review.destroy();
        res.status(200).json({ success: true, msg: "Review successfully removed" });
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Something went wrong. Please try again later"
        });
    };
}
