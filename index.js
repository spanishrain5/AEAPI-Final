require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const host = process.env.HOST || '127.0.0.1' ; 
const port = process.env.PORT || 8080;

app.use(cors()); //enable ALL CORS requests (client requests from other domain)
app.use(express.json()); //enable parsing JSON body data

// root route -- /api/
app.get('/', (req, res) => {
    res.status(200).json({ message: 'home -- Accommodations and Events API' });
});

// routing middleware for resources
app.use('/students', require('./routes/studentsRoutes.js'));
app.use('/facilitators', require('./routes/facilitatorsRoutes.js'));
app.use('/accommodations', require('./routes/accommodationsRoutes.js'));
app.use('/events', require('./routes/eventsRoutes.js'));
app.use('/bookings', require('./routes/bookingsRoutes.js'));
app.use('/reviews', require('./routes/reviewsRoutes.js'));
app.use('/interested-users', require('./routes/interestedUsersRoutes.js'));


// login
app.use('/login', require('./routes/loginRoutes.js'));


// handle invalid routes
app.all('*', (req, res) => {
    res.status(404).json({ message: 'Invalid route' });
})
app.listen(port, host, () => {
    console.log(`App listening at http://${host}:${port}/`);
});