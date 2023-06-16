const express = require('express');

const router = express.Router();

// import controller middleware
const reviewsController = require("../controllers/reviewsController.js");
const authController = require("../controllers/authController");

router.route('/')
    

router.route('/:id')
    

router.all('*', (req, res) => {
    res.status(404).json({ message: 'reviews: Invalid route' }); //send a predefined error message
})

//export this router
module.exports = router;