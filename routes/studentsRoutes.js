const express = require('express');

const router = express.Router();

// import controller middleware
const studentsController = require("../controllers/studentsController");
const authController = require("../controllers/authController");

router.route('/')
    .get( authController.verifyToken, studentsController.findAll )
    .post( studentsController.create );

router.route('/:id')
    .get( authController.verifyToken, studentsController.findOne )
    .delete( authController.verifyToken, studentsController.delete );

router.all('*', (req, res) => {
    res.status(404).json({ message: 'students: Invalid route' }); //send a predefined error message
})

//export this router
module.exports = router;