const { DataTypes } = require('sequelize')
const { sequelize } = require('../../config/database')

const Chat = sequelize.define('Chat', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    chat: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'chats',
    timestamps: true,
})

module.exports = Chat
