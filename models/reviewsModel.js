module.exports = (sequelize, DataTypes) => {
    const Review = sequelize.define("reviews", {
        /*
        facilitator_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            default: 0,
        },
        */
        rating: {
            type: DataTypes.DECIMAL,
            allowNull: false,
            validate: {
                notNull: { msg: "Please provide rating" }, 
                isDecimal: { msg: "Must be number" }
            },
        },
        review_text: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        timestamps: false
    });
    return Review;
    };