const mongoose = require('mongoose')

const webhookSchema = new mongoose.Schema({
    instance_key: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    webhook_url: {
        type: String,
        required: true
    },
    enabled: {
        type: Boolean,
        default: true
    },
    events: {
        messages: { type: Boolean, default: true },
        messages_upsert: { type: Boolean, default: true },
        messages_update: { type: Boolean, default: true },
        messages_delete: { type: Boolean, default: true },
        message_reaction: { type: Boolean, default: true },
        presence_update: { type: Boolean, default: false },
        chats_upsert: { type: Boolean, default: false },
        chats_update: { type: Boolean, default: false },
        chats_delete: { type: Boolean, default: false },
        contacts_upsert: { type: Boolean, default: false },
        contacts_update: { type: Boolean, default: false },
        groups_upsert: { type: Boolean, default: false },
        groups_update: { type: Boolean, default: false },
        group_participants_update: { type: Boolean, default: false },
        connection_update: { type: Boolean, default: true }
    },
    retry_count: {
        type: Number,
        default: 3
    },
    retry_delay: {
        type: Number,
        default: 1000
    },
    last_success_at: {
        type: Date,
        default: null
    },
    last_failure_at: {
        type: Date,
        default: null
    },
    last_error: {
        type: String,
        default: null
    },
    total_sent: {
        type: Number,
        default: 0
    },
    total_failed: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true // Adiciona createdAt e updatedAt automaticamente
})

// Índices para melhor performance
webhookSchema.index({ instance_key: 1 })
webhookSchema.index({ enabled: 1 })
webhookSchema.index({ createdAt: -1 })

const Webhook = mongoose.model('Webhook', webhookSchema)

module.exports = Webhook
