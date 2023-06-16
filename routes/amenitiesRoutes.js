const express = require('express');

const router = express.Router();

// import controller middleware
const amenitiesController = require("../controllers/amenitiesController");
router.route('/')
  

router.all('*', (req, res) => {
    res.status(404).json({ message: 'amenities: Invalid route' }); //send a predefined error message
})

//export this router
module.exports = router;