const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
    instance_key: {
        type: String,
        required: true,
        index: true
    },
    chat_id: {
        type: String,
        required: true
    },
    name: String,
    is_group: {
        type: Boolean,
        default: false
    },
    participants: [{
        jid: String,
        admin: Boolean,
        name: String
    }],
    unread_count: {
        type: Number,
        default: 0
    },
    last_message_timestamp: {
        type: Date,
        index: true
    },
    archived: {
        type: Boolean,
        default: false
    },
    pinned: {
        type: Boolean,
        default: false
    },
    muted: {
        type: Boolean,
        default: false
    },
    metadata: mongoose.Schema.Types.Mixed
}, {
    timestamps: true
})

// Índice único composto
chatSchema.index({ instance_key: 1, chat_id: 1 }, { unique: true })

module.exports = mongoose.model('Chat', chatSchema)
