const express = require('express');

const router = express.Router();

// import controller middleware
const facilitatorsController = require("../controllers/facilitatorsController.js");
const authController = require("../controllers/authController");

router.route('/')
    .get( authController.verifyToken, facilitatorsController.findAll )
    .post( facilitatorsController.create );

router.route('/:id')
    .get( authController.verifyToken, facilitatorsController.findOne )
    .patch( authController.verifyToken, facilitatorsController.validate )
    .delete( authController.verifyToken, facilitatorsController.delete );


router.all('*', (req, res) => {
    res.status(404).json({ message: 'facilitators: Invalid route' }); //send a predefined error message
})

//export this router
module.exports = router;