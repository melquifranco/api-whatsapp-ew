const WebhookService = require('../services/webhook.service')
const { WhatsAppInstances } = require('../class/instance')

/**
 * Configura webhook para uma instância
 */
exports.setWebhook = async (req, res) => {
    try {
        const key = req.query.key
        const { webhook_url, events, enabled } = req.body

        if (!key) {
            return res.status(400).json({
                error: true,
                message: 'Instance key is required'
            })
        }

        if (!webhook_url) {
            return res.status(400).json({
                error: true,
                message: 'webhook_url is required'
            })
        }

        // Verifica se a instância existe
        const instance = WhatsAppInstances[key]
        if (!instance) {
            return res.status(404).json({
                error: true,
                message: 'Instance not found'
            })
        }

        // Registra webhook
        const webhook = await WebhookService.registerWebhook(
            key,
            webhook_url,
            events,
            enabled !== undefined ? enabled : true
        )

        return res.status(200).json({
            error: false,
            message: 'Webhook configured successfully',
            webhook: webhook
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message
        })
    }
}

/**
 * Obtém configuração de webhook de uma instância
 */
exports.getWebhook = async (req, res) => {
    try {
        const key = req.query.key

        if (!key) {
            return res.status(400).json({
                error: true,
                message: 'Instance key is required'
            })
        }

        const webhook = await WebhookService.getWebhook(key)

        if (!webhook) {
            return res.status(404).json({
                error: true,
                message: 'Webhook not found for this instance'
            })
        }

        return res.status(200).json({
            error: false,
            message: 'Webhook found',
            webhook: webhook
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message
        })
    }
}

/**
 * Remove webhook de uma instância
 */
exports.removeWebhook = async (req, res) => {
    try {
        const key = req.query.key

        if (!key) {
            return res.status(400).json({
                error: true,
                message: 'Instance key is required'
            })
        }

        const removed = await WebhookService.removeWebhook(key)

        if (!removed) {
            return res.status(404).json({
                error: true,
                message: 'Webhook not found for this instance'
            })
        }

        return res.status(200).json({
            error: false,
            message: 'Webhook removed successfully'
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message
        })
    }
}

/**
 * Testa webhook enviando uma mensagem de teste
 */
exports.testWebhook = async (req, res) => {
    try {
        const key = req.query.key

        if (!key) {
            return res.status(400).json({
                error: true,
                message: 'Instance key is required'
            })
        }

        const webhook = await WebhookService.getWebhook(key)

        if (!webhook) {
            return res.status(404).json({
                error: true,
                message: 'Webhook not found for this instance'
            })
        }

        // Envia mensagem de teste
        const testData = {
            test: true,
            message: 'This is a test webhook from WhatsApp API',
            timestamp: Date.now()
        }

        const sent = await WebhookService.sendWebhook(key, 'test', testData)

        return res.status(200).json({
            error: false,
            message: sent ? 'Webhook test sent successfully' : 'Webhook test failed',
            sent: sent
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message
        })
    }
}

/**
 * Lista mensagens recebidas (histórico)
 */
exports.getMessages = async (req, res) => {
    try {
        const key = req.query.key
        const limit = req.query.limit ? parseInt(req.query.limit) : 50

        if (!key) {
            return res.status(400).json({
                error: true,
                message: 'Instance key is required'
            })
        }

        // TODO: Implement message retrieval from MongoDB if needed
        return res.status(200).json({
            error: false,
            message: 'Message retrieval not yet implemented for MongoDB',
            count: 0,
            messages: []
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message
        })
    }
}
