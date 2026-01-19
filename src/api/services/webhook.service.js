const axios = require('axios')
const logger = require('pino')()
const config = require('../../config/config')

// In-memory storage for webhooks (will be replaced by MongoDB later)
const webhooks = new Map()

class WebhookService {
    /**
     * Registra ou atualiza webhook para uma instância
     */
    static async registerWebhook(instanceKey, webhookUrl, events = null, enabled = true) {
        try {
            const webhook = {
                instance_key: instanceKey,
                webhook_url: webhookUrl,
                enabled: enabled,
                events: events || {
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
                retry_count: 3,
                retry_delay: 1000,
                last_success_at: null,
                last_failure_at: null,
                last_error: null,
                total_sent: 0,
                total_failed: 0,
            }

            webhooks.set(instanceKey, webhook)
            logger.info(`Webhook registered for instance ${instanceKey}`)
            return webhook
        } catch (error) {
            logger.error(`Failed to register webhook for instance ${instanceKey}:`, error)
            throw error
        }
    }

    /**
     * Obtém configuração de webhook de uma instância
     */
    static async getWebhook(instanceKey) {
        return webhooks.get(instanceKey) || null
    }

    /**
     * Remove webhook de uma instância
     */
    static async removeWebhook(instanceKey) {
        const deleted = webhooks.delete(instanceKey)
        if (deleted) {
            logger.info(`Webhook removed for instance ${instanceKey}`)
        }
        return deleted
    }

    /**
     * Envia evento para webhook
     */
    static async sendWebhook(instanceKey, eventType, data) {
        const webhook = await this.getWebhook(instanceKey)

        if (!webhook || !webhook.enabled) {
            logger.debug(`Webhook not configured or disabled for instance ${instanceKey}`)
            return false
        }

        // Verifica se o evento está habilitado
        if (webhook.events && !webhook.events[eventType]) {
            logger.debug(`Event ${eventType} is disabled for instance ${instanceKey}`)
            return false
        }

        const payload = {
            instance_key: instanceKey,
            event: eventType,
            data: data,
            timestamp: Date.now(),
        }

        let attempt = 0
        let lastError = null

        while (attempt < webhook.retry_count) {
            try {
                const response = await axios.post(webhook.webhook_url, payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'WhatsApp-API-Webhook/1.0',
                    },
                    timeout: 10000, // 10 segundos
                })

                // Sucesso
                webhook.last_success_at = new Date()
                webhook.total_sent++
                webhooks.set(instanceKey, webhook)

                logger.info(`Webhook sent successfully for instance ${instanceKey}, event: ${eventType}`)
                return true

            } catch (error) {
                lastError = error.message
                attempt++
                
                logger.warn(`Webhook failed for instance ${instanceKey}, attempt ${attempt}/${webhook.retry_count}: ${error.message}`)

                if (attempt < webhook.retry_count) {
                    // Aguarda antes de tentar novamente
                    await new Promise(resolve => setTimeout(resolve, webhook.retry_delay))
                }
            }
        }

        // Todas as tentativas falharam
        webhook.last_failure_at = new Date()
        webhook.last_error = lastError
        webhook.total_failed++
        webhooks.set(instanceKey, webhook)

        logger.error(`Webhook failed after ${webhook.retry_count} attempts for instance ${instanceKey}`)
        return false
    }

    /**
     * Salva mensagem recebida (in-memory para agora, MongoDB depois)
     */
    static async saveMessage(instanceKey, messageData) {
        // TODO: Implement MongoDB storage
        logger.debug(`Message received for instance ${instanceKey}`)
        return null
    }

    /**
     * Marca mensagem como enviada para webhook
     */
    static async markMessageWebhookSent(messageId) {
        // TODO: Implement MongoDB storage
        return true
    }

    /**
     * Busca mensagens não enviadas para webhook
     */
    static async getPendingWebhookMessages(instanceKey, limit = 100) {
        // TODO: Implement MongoDB storage
        return []
    }
}

module.exports = WebhookService
