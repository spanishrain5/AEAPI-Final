const { facilitator } = require(".");

module.exports = (sequelize, DataTypes) => {
    const Facilitator = sequelize.define("facilitator", {
        email: {
            type: DataTypes.STRING,
            unique: {
                arg: true,
                msg: "Account with that email already exists"
            },
            allowNull: false,
            validate: { 
                notNull: { msg: "Please provide email" },
                isEmail: { msg: "Invalid email" }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { 
                notNull: { msg: "Please provide password" }
            },
            trim: true, //removes spaces at beginning and end
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { 
                notNull: { msg: "Please provide first name" },
                isAlpha: { msg: "Invalid first name" }
            }
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { 
                notNull: { msg: "Please provide last name" },
                isAlpha: { msg: "Invalid last name" }
            }
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { 
                notNull: { msg: "Please provide phone number" },
                checkPhone(value) {
                    const phoneRegexp = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
                    if (!phoneRegexp.test(value)) {
                        throw new Error('Invalid phone number');
                    }
                }
            }
        },
        validated: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            default: false
        }
    }, {
        timestamps: false
    });
    return Facilitator;
    };