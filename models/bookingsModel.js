module.exports = (sequelize, DataTypes) => {
    const Booking = sequelize.define("bookings", {
        booking_start: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notNull: { msg: "Please provide booking start date" }, 
                isDate: { msg: "Must be date" }
            },
        },
        booking_end: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notNull: { msg: "Please provide booking end date" }, 
                isDate: { msg: "Must be date" }
            },
        },
        num_of_people: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "Please provide number of guests" }
            }
        },
        validated: {
            type: DataTypes.BOOLEAN,
            default: false,
        }
    }, {
        timestamps: false
    });
    return Booking;
    };
