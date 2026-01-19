const { DataTypes } = require('sequelize')
const { sequelize } = require('../../config/database')

const Webhook = sequelize.define('Webhook', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    instance_key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    webhook_url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    events: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
            messages: true,
            messages_upsert: true,
            messages_update: true,
            messages_delete: true,
            message_reaction: true,
            presence_update: false,
            chats_upsert: false,
            chats_update: false,
            chats_delete: false,
            contacts_upsert: false,
            contacts_update: false,
            groups_upsert: false,
            groups_update: false,
            group_participants_update: false,
            connection_update: true,
        },
    },
    retry_count: {
        type: DataTypes.INTEGER,
        defaultValue: 3,
    },
    retry_delay: {
        type: DataTypes.INTEGER,
        defaultValue: 1000, // ms
    },
    last_error: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    last_success_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    last_failure_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    total_sent: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    total_failed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
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
    tableName: 'webhooks',
    timestamps: true,
})

module.exports = Webhook
