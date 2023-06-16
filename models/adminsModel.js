module.exports = (sequelize, DataTypes) => {
    const Admin = sequelize.define("administrators", {
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: { 
                notNull: { msg: "can not be empty!" },
                isEmail: { msg: "Invalid format" }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            trim: true, //removes spaces at beginning and end
        },
    }, {
        timestamps: false
    });
    return Admin;
    };