const express = require('express');

const router = express.Router();

// import controller middleware
const interestedUsersController = require("../controllers/interestedUsersController");
router.route('/')
   

router.all('*', (req, res) => {
    res.status(404).json({ message: 'interestedUsers: Invalid route' }); //send a predefined error message
})

//export this router
module.exports = router;