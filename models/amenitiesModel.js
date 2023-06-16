module.exports = (sequelize, DataTypes) => {
    const Amenity = sequelize.define("amenities", {
        /*
        accommodation_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        */
        amenity: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { 
                notNull: { msg: "Please provide amenity name" }
            },
        }
    }, {
        timestamps: false
    });
    return Amenity;
    };