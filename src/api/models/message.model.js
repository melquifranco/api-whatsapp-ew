const { DataTypes } = require('sequelize')
const { sequelize } = require('../../config/database')

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    instance_key: {
        type: DataTypes.STRING,
        allowNull: false,
        index: true,
    },
    message_id: {
        type: DataTypes.STRING,
        allowNull: false,
        index: true,
    },
    remote_jid: {
        type: DataTypes.STRING,
        allowNull: false,
        index: true,
    },
    from_me: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    participant: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    message_type: {
        type: DataTypes.STRING,
        allowNull: false,
        // conversation, imageMessage, videoMessage, audioMessage, documentMessage, etc
    },
    message_text: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    message_data: {
        type: DataTypes.JSON,
        allowNull: false,
        // Armazena o objeto message completo do Baileys
    },
    timestamp: {
        type: DataTypes.BIGINT,
        allowNull: false,
        index: true,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'received',
        // received, read, delivered, failed
    },
    webhook_sent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    webhook_sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
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
    tableName: 'messages',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['instance_key', 'message_id', 'remote_jid']
        },
        {
            fields: ['timestamp']
        },
        {
            fields: ['from_me']
        },
        {
            fields: ['webhook_sent']
        }
    ]
})

module.exports = Message
