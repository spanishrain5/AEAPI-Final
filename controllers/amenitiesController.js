const db = require("../models/index.js");
const Amenity = db.amenity;
const Accommodation = db.accommodation;

const { ValidationError } = require('sequelize'); //necessary for model validations using sequelize

exports.create = async (req, res) => {
    
    var listing = await Accommodation.findOne({ where: { id: req.params.id } });
    
    if (req.loggedUserType !== "admin" && (req.loggedUserType != "facilitator" || req.loggedUserId != listing.facilitator_id)) {
        return res.status(403).json({
            success: false, msg: "You do not have permission to access this resource (delete)"
        });   
    }

    Amenity.create({
        amenity: req.body.amenity
    }) 
        .then(data => {
            data.accommodation_id = req.params.id;
            data.save()

            res.status(201).json({ success:true, msg:"Amenity added", URL:`accommodations/${req.params.id}/amenities/${data.id}`});
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

exports.delete = async (req, res) => {
    try {

        //console.log(req.loggedUserType);

        let listing = await Accommodation.findOne({ where: { id: req.params.id } });
        let amenityToDelete = await Amenity.findOne({ where: { id: req.params.amenity_id} });

        if (!listing) {
            res.status(404).json({
                success: false, msg: "Accommodation not found"
            })
        } else if (req.loggedUserType !== "admin" && (req.loggedUserType != "facilitator" || req.loggedUserId != listing.facilitator_id)) {
            return res.status(403).json({
                success: false, msg: "You do not have permission to access this resource (delete)"
            });   
        } else if (!amenityToDelete) {
            res.status(404).json({
                success: false, msg: "Amenity not found"
            })
        }
        else {
            amenityToDelete.destroy();
            res.status(200).json({ success: true, msg: "Amenity successfully removed" });
        }
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Something went wrong. Please try again later"
        });
    };
}

exports.findAll = async (req, res) => {
    try {
        // do not expose users' sensitive data
        
        let listing = await Accommodation.findAll({ where: { id: req.params.id } });

        if (!listing) {
            res.status(404).json({
                success: false, msg: "Accommodation not found."
            });
        }
        
        let amenities = await Amenity.findAll({ 
            where: { accommodation_id: req.params.id },
            attributes: ['id', 'amenity'] 
        })
    
        if (!amenities) {
            res.status(200).json({
                success: false, msg: "No amenities found for this accommodation."
            });
        }

        res.status(200).json({ success: true, amenities: amenities });
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Something went wrong. Please try again later."
        });
    };
};

exports.findOne = async (req, res) => {
    try {
        // do not expose users' sensitive data
        
        let listing = await Accommodation.findAll({ where: { id: req.params.id } });

        if (!listing) {
            res.status(404).json({
                success: false, msg: "Accommodation not found."
            });
        }
        
        let amenities = await Amenity.findAll({ 
            where: { accommodation_id: req.params.id, id: req.params.amenity_id },
            attributes: ['id', 'amenity'] 
        })
    
        if (!amenities) {
            res.status(200).json({
                success: false, msg: "No amenities found for this accommodation."
            });
        }

        res.status(200).json({ success: true, amenities: amenities });
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Something went wrong. Please try again later."
        });
    };
};