const WebhookService = require('../services/webhook.service')

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

        // Valida URL
        try {
            new URL(webhook_url)
        } catch (error) {
            return res.status(400).json({
                error: true,
                message: 'Invalid webhook URL format'
            })
        }

        // Registra webhook (não precisa verificar se instância existe)
        const webhook = await WebhookService.registerWebhook(
            key,
            webhook_url,
            events,
            enabled !== undefined ? enabled : true
        )

        return res.status(200).json({
            error: false,
            message: 'Webhook configured successfully',
            webhook: {
                instance_key: webhook.instance_key,
                webhook_url: webhook.webhook_url,
                enabled: webhook.enabled,
                events: webhook.events,
                retry_count: webhook.retry_count,
                retry_delay: webhook.retry_delay,
                created_at: webhook.createdAt,
                updated_at: webhook.updatedAt
            }
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
            webhook: {
                instance_key: webhook.instance_key,
                webhook_url: webhook.webhook_url,
                enabled: webhook.enabled,
                events: webhook.events,
                retry_count: webhook.retry_count,
                retry_delay: webhook.retry_delay,
                total_sent: webhook.total_sent,
                total_failed: webhook.total_failed,
                last_success_at: webhook.last_success_at,
                last_failure_at: webhook.last_failure_at,
                last_error: webhook.last_error,
                created_at: webhook.createdAt,
                updated_at: webhook.updatedAt
            }
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
 * Lista todos os webhooks configurados
 */
exports.listWebhooks = async (req, res) => {
    try {
        const webhooks = await WebhookService.listWebhooks()

        return res.status(200).json({
            error: false,
            message: 'Webhooks retrieved successfully',
            count: webhooks.length,
            webhooks: webhooks.map(w => ({
                instance_key: w.instance_key,
                webhook_url: w.webhook_url,
                enabled: w.enabled,
                total_sent: w.total_sent,
                total_failed: w.total_failed,
                last_success_at: w.last_success_at,
                last_failure_at: w.last_failure_at,
                created_at: w.createdAt,
                updated_at: w.updatedAt
            }))
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message
        })
    }
}

/**
 * Obtém estatísticas de um webhook
 */
exports.getWebhookStats = async (req, res) => {
    try {
        const key = req.query.key

        if (!key) {
            return res.status(400).json({
                error: true,
                message: 'Instance key is required'
            })
        }

        const stats = await WebhookService.getWebhookStats(key)

        if (!stats) {
            return res.status(404).json({
                error: true,
                message: 'Webhook not found for this instance'
            })
        }

        return res.status(200).json({
            error: false,
            message: 'Webhook statistics retrieved successfully',
            stats: stats
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message
        })
    }
}
