const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    instance_key: {
        type: String,
        required: true,
        index: true
    },
    message_id: {
        type: String,
        required: true,
        index: true
    },
    remote_jid: {
        type: String,
        required: true,
        index: true
    },
    from_me: {
        type: Boolean,
        default: false
    },
    participant: String,
    message_type: String,
    message_content: mongoose.Schema.Types.Mixed,
    message_timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED'],
        default: 'PENDING'
    },
    webhook_sent: {
        type: Boolean,
        default: false
    },
    webhook_sent_at: Date,
    raw_data: mongoose.Schema.Types.Mixed
}, {
    timestamps: true
})

// Índice composto para busca eficiente
messageSchema.index({ instance_key: 1, remote_jid: 1, message_timestamp: -1 })
messageSchema.index({ instance_key: 1, message_id: 1 }, { unique: true })

module.exports = mongoose.model('Message', messageSchema)
