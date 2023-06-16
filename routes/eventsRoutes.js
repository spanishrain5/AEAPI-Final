const express = require('express');

const authController = require("../controllers/authController");
const router = express.Router();

// import controller middleware
const eventsController = require("../controllers/eventsController");
const interestedUsersController = require("../controllers/interestedUsersController");

router.route('/')
    .get( eventsController.findAll )
    .post( authController.verifyToken, eventsController.create );

router.route('/:id')
    .get( eventsController.findOne)
    .put( authController.verifyToken, eventsController.update )
    .patch( authController.verifyToken, eventsController.validate )
    .delete( authController.verifyToken, eventsController.delete );

router.route('/:id/interested')
    .post( authController.verifyToken, interestedUsersController.create )
    .get( interestedUsersController.findAll );

router.route('/:id/interested/:user_id')
    .get( interestedUsersController.findOne )
    .delete( authController.verifyToken, interestedUsersController.delete );


router.all('*', (req, res) => {
    res.status(404).json({ message: 'events: Invalid route' }); //send a predefined error message
})

//export this router
module.exports = router;