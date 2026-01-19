const { DataTypes } = require('sequelize')
const { sequelize } = require('../../config/database')

/**
 * Modelo Chat
 * Armazena informações sobre conversas e grupos do WhatsApp
 */
const Chat = sequelize.define('Chat', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    instanceKey: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'instance_key',
    },
    remoteJid: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'remote_jid',
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isGroup: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_group',
    },
    participantCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'participant_count',
    },
    lastMessageTime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_message_time',
    },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
    },
}, {
    tableName: 'chats',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['instance_key', 'remote_jid'],
            name: 'unique_chat',
        },
        {
            fields: ['instance_key'],
            name: 'idx_chats_instance',
        },
        {
            fields: ['remote_jid'],
            name: 'idx_chats_remote_jid',
        },
        {
            fields: ['is_group'],
            name: 'idx_chats_is_group',
        },
    ],
})

module.exports = Chat
