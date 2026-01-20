const mongoose = require('mongoose')

const contactSchema = new mongoose.Schema({
    instance_key: {
        type: String,
        required: true,
        index: true
    },
    contact_id: {
        type: String,
        required: true
    },
    name: String,
    notify: String,
    verified_name: String,
    img_url: String,
    status: String
}, {
    timestamps: true
})

// Índice único composto
contactSchema.index({ instance_key: 1, contact_id: 1 }, { unique: true })

module.exports = mongoose.model('Contact', contactSchema)
