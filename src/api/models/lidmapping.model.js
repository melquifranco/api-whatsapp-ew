const mongoose = require('mongoose')

const lidMappingSchema = new mongoose.Schema(
    {
        instance_key: {
            type: String,
            required: true,
            index: true,
        },
        lid: {
            type: String,
            required: true,
            index: true,
        },
        phone_number: {
            type: String,
            required: true,
            index: true,
        },
        first_seen: {
            type: Date,
            default: Date.now,
        },
        last_seen: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
)

// Índice composto para busca rápida
lidMappingSchema.index({ instance_key: 1, lid: 1 }, { unique: true })
lidMappingSchema.index({ instance_key: 1, phone_number: 1 })

const LidMapping = mongoose.model('LidMapping', lidMappingSchema)

module.exports = LidMapping
