module.exports = (sequelize, DataTypes) => {
    const Event = sequelize.define("events", {
        /*
        facilitator_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            default: 0,
        },
        */
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                   msg: "Please provide a title"
                },
             }
        },
        area: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                   msg: "Please provide area name"
                },
             }
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                   msg: "Please provide adress"
                },
             }
        },
        event_type: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                   msg: "Please specify event type"
                },
                isIn: {
                    args: [['Concert', 'Outdoors', 'Comedy', 'Theater', 'Discussion', 'Educational', 'Miscellaneous']],
                    msg: "Invalid event type. Can be 'Concert', 'Outdoors', 'Comedy', 'Theater', 'Discussion', 'Educational' or 'Miscellaneous'"
                }
             },
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Please specify date"
                 }, 
                isDate: { msg: "Must be date" }
            }
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            notNull: {
                msg: "Please provide a description"
            },
        },
        validated: {
            type: DataTypes.BOOLEAN,
            default: false,
        }
    }, {
        timestamps: false
    });
    return Event;
    };


    