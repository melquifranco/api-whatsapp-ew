const axios = require('axios')
const logger = require('pino')()
const Webhook = require('../models/webhook.model')

class WebhookService {
    /**
     * Registra ou atualiza webhook para uma instância
     */
    static async registerWebhook(instanceKey, webhookUrl, events = null, enabled = true) {
        try {
            const webhookData = {
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
            }

            // Usa upsert para criar ou atualizar
            const webhook = await Webhook.findOneAndUpdate(
                { instance_key: instanceKey },
                webhookData,
                { 
                    upsert: true, 
                    new: true, // Retorna o documento atualizado
                    setDefaultsOnInsert: true 
                }
            )

            logger.info(`Webhook registered/updated for instance ${instanceKey}`)
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
        try {
            const webhook = await Webhook.findOne({ instance_key: instanceKey })
            return webhook
        } catch (error) {
            logger.error(`Failed to get webhook for instance ${instanceKey}:`, error)
            return null
        }
    }

    /**
     * Remove webhook de uma instância
     */
    static async removeWebhook(instanceKey) {
        try {
            const result = await Webhook.deleteOne({ instance_key: instanceKey })
            if (result.deletedCount > 0) {
                logger.info(`Webhook removed for instance ${instanceKey}`)
                return true
            }
            return false
        } catch (error) {
            logger.error(`Failed to remove webhook for instance ${instanceKey}:`, error)
            return false
        }
    }

    /**
     * Envia evento para webhook
     */
    static async sendWebhook(instanceKey, eventType, data) {
        try {
            const webhook = await this.getWebhook(instanceKey)

            if (!webhook || !webhook.enabled) {
                logger.debug(`Webhook not configured or disabled for instance ${instanceKey}`)
                return false
            }

            // Verifica se o evento está habilitado (exceto 'test')
            if (eventType !== 'test' && webhook.events && !webhook.events[eventType]) {
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

                    // Sucesso - atualiza estatísticas no MongoDB
                    await Webhook.updateOne(
                        { instance_key: instanceKey },
                        {
                            $set: { last_success_at: new Date() },
                            $inc: { total_sent: 1 }
                        }
                    )

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

            // Todas as tentativas falharam - atualiza estatísticas no MongoDB
            await Webhook.updateOne(
                { instance_key: instanceKey },
                {
                    $set: { 
                        last_failure_at: new Date(),
                        last_error: lastError
                    },
                    $inc: { total_failed: 1 }
                }
            )

            logger.error(`Webhook failed after ${webhook.retry_count} attempts for instance ${instanceKey}`)
            return false
        } catch (error) {
            logger.error(`Error in sendWebhook for instance ${instanceKey}:`, error)
            return false
        }
    }

    /**
     * Lista todos os webhooks configurados
     */
    static async listWebhooks() {
        try {
            const webhooks = await Webhook.find({}).sort({ createdAt: -1 })
            return webhooks
        } catch (error) {
            logger.error('Failed to list webhooks:', error)
            return []
        }
    }

    /**
     * Obtém estatísticas de um webhook
     */
    static async getWebhookStats(instanceKey) {
        try {
            const webhook = await this.getWebhook(instanceKey)
            if (!webhook) {
                return null
            }

            return {
                instance_key: webhook.instance_key,
                enabled: webhook.enabled,
                total_sent: webhook.total_sent,
                total_failed: webhook.total_failed,
                success_rate: webhook.total_sent + webhook.total_failed > 0 
                    ? ((webhook.total_sent / (webhook.total_sent + webhook.total_failed)) * 100).toFixed(2) + '%'
                    : 'N/A',
                last_success_at: webhook.last_success_at,
                last_failure_at: webhook.last_failure_at,
                last_error: webhook.last_error,
                created_at: webhook.createdAt,
                updated_at: webhook.updatedAt
            }
        } catch (error) {
            logger.error(`Failed to get webhook stats for instance ${instanceKey}:`, error)
            return null
        }
    }
}

module.exports = WebhookService
