const dbConfig = require('../config/db.config.js');

//export classes Sequelize and Datatypes
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST, 
    dialect: dbConfig.dialect,
});

// OPTIONAL: test the connection
(async () => { 
    try {
        await sequelize.authenticate;
        console.log('Connection has been established successfully.');
    } catch (err) {
        console.error('Unable to connect to the database:', err);
    }
})();

const db = {}; //object to be exported
db.sequelize = sequelize; //save the Sequelize instance (actual connection pool)

db.student = require("./studentsModel.js")(sequelize, DataTypes);
db.facilitator = require("./facilitatorsModel.js")(sequelize, DataTypes);
db.accommodation = require("./accommodationsModel.js")(sequelize, DataTypes);
db.event = require("./eventsModel.js")(sequelize, DataTypes);
db.booking = require("./bookingsModel.js")(sequelize, DataTypes);
db.review = require("./reviewsModel.js")(sequelize, DataTypes);
db.interestedUser = require("./interestedUsersModel")(sequelize, DataTypes);
db.amenity = require("./amenitiesModel")(sequelize, DataTypes);

db.admin = require("./adminsModel")(sequelize, DataTypes);

//Accommodation - facilitator
db.facilitator.hasMany(db.accommodation, { foreignKey: 'facilitator_id' });
db.accommodation.belongsTo(db.facilitator, { foreignKey: 'facilitator_id' });

//Event - facilitator
db.facilitator.hasMany(db.event, { foreignKey: 'facilitator_id' });
db.event.belongsTo(db.facilitator, { foreignKey: 'facilitator_id' });

//Booking - accommodation and student
db.student.hasMany(db.booking, { foreignKey: 'student_id' });
db.booking.belongsTo(db.student, { foreignKey: 'student_id' });
db.accommodation.hasMany(db.booking, { foreignKey: 'accommodation_id' });
db.booking.belongsTo(db.accommodation, { foreignKey: 'accommodation_id' });

//Review - accommodation and student
db.accommodation.hasMany(db.review, { foreignKey: 'accommodation_id' });
db.review.belongsTo(db.accommodation, { foreignKey: 'accommodation_id' });
db.student.hasMany(db.review, { foreignKey: 'student_id' });
db.review.belongsTo(db.student, { foreignKey: 'student_id' });

//Interested users - event and student
db.event.hasMany(db.interestedUser, { foreignKey: 'event_id' });
db.interestedUser.belongsTo(db.event, { foreignKey: 'event_id' });
db.student.hasMany(db.interestedUser, { foreignKey: 'student_id' });
db.interestedUser.belongsTo(db.student, { foreignKey: 'student_id' });

//Amenity - accommodation
db.accommodation.hasMany(db.amenity, { foreignKey: 'accommodation_id' });
db.amenity.belongsTo(db.accommodation, { foreignKey: 'accommodation_id' });


// OPTIONAL: synchronize the DB with the sequelize model
(async () => {
    try {
        await db.sequelize.sync({ force: true });
        console.log('DB is successfully synchronized')
    } catch (error) {
        console.log(error)
    }
})();
//

module.exports = db; //export the db object with the sequelize instance and tutorial model


