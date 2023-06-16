const express = require('express');

const router = express.Router();

// import controller middleware
const loginController = require("../controllers/loginController");
router.route('/')
    .post( loginController.login );

router.all('*', (req, res) => {
    res.status(404).json({ message: 'students: Invalid route' }); //send a predefined error message
})

//export this router
module.exports = router;