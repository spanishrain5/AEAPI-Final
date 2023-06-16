module.exports = (sequelize, DataTypes) => {
    const InterestedUser = sequelize.define("interested-users", {
       
    }, {
        timestamps: false
    });
    return InterestedUser;
    };