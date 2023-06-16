const express = require('express');

const router = express.Router();

// import controller middleware
const bookingsController = require("../controllers/bookingsController");
const authController = require("../controllers/authController");

router.route('/')
    .get( authController.verifyToken, bookingsController.findAll )
    .post( authController.verifyToken, bookingsController.create );

router.route('/:id')
    .get( authController.verifyToken, bookingsController.findOne)
    .patch( authController.verifyToken, bookingsController.validate )
    .delete( authController.verifyToken, bookingsController.delete );

router.all('*', (req, res) => {
    res.status(404).json({ message: 'bookings: Invalid route' }); //send a predefined error message
})

//export this router
module.exports = router;