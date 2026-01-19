const axios = require('axios')
const logger = require('pino')()
const Webhook = require('../models/webhook.model')
const Message = require('../models/message.model')
const { postgresEnabled } = require('../../config/database')

class WebhookService {
    /**
     * Registra ou atualiza webhook para uma instância
     */
    static async registerWebhook(instanceKey, webhookUrl, events = null, enabled = true) {
        if (!postgresEnabled) {
            logger.warn('PostgreSQL is disabled, webhook will not be persisted')
            return null
        }

        try {
            const [webhook, created] = await Webhook.upsert({
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
            }, {
                returning: true
            })

            logger.info(`Webhook ${created ? 'created' : 'updated'} for instance ${instanceKey}`)
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
        if (!postgresEnabled) {
            return null
        }

        try {
            const webhook = await Webhook.findOne({
                where: { instance_key: instanceKey }
            })
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
        if (!postgresEnabled) {
            return false
        }

        try {
            const deleted = await Webhook.destroy({
                where: { instance_key: instanceKey }
            })
            logger.info(`Webhook removed for instance ${instanceKey}`)
            return deleted > 0
        } catch (error) {
            logger.error(`Failed to remove webhook for instance ${instanceKey}:`, error)
            return false
        }
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
                await webhook.update({
                    last_success_at: new Date(),
                    total_sent: webhook.total_sent + 1,
                })

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
        await webhook.update({
            last_failure_at: new Date(),
            last_error: lastError,
            total_failed: webhook.total_failed + 1,
        })

        logger.error(`Webhook failed after ${webhook.retry_count} attempts for instance ${instanceKey}`)
        return false
    }

    /**
     * Salva mensagem recebida no banco de dados
     */
    static async saveMessage(instanceKey, messageData) {
        if (!postgresEnabled) {
            return null
        }

        try {
            const key = messageData.key
            const message = messageData.message

            // Extrai o texto da mensagem
            let messageText = null
            let messageType = 'unknown'

            if (message.conversation) {
                messageText = message.conversation
                messageType = 'conversation'
            } else if (message.extendedTextMessage) {
                messageText = message.extendedTextMessage.text
                messageType = 'extendedTextMessage'
            } else if (message.imageMessage) {
                messageText = message.imageMessage.caption || null
                messageType = 'imageMessage'
            } else if (message.videoMessage) {
                messageText = message.videoMessage.caption || null
                messageType = 'videoMessage'
            } else if (message.audioMessage) {
                messageType = 'audioMessage'
            } else if (message.documentMessage) {
                messageText = message.documentMessage.caption || null
                messageType = 'documentMessage'
            } else if (message.stickerMessage) {
                messageType = 'stickerMessage'
            } else if (message.locationMessage) {
                messageType = 'locationMessage'
            } else if (message.contactMessage) {
                messageType = 'contactMessage'
            }

            const savedMessage = await Message.create({
                instance_key: instanceKey,
                message_id: key.id,
                remote_jid: key.remoteJid,
                from_me: key.fromMe || false,
                participant: key.participant || null,
                message_type: messageType,
                message_text: messageText,
                message_data: messageData,
                timestamp: messageData.messageTimestamp || Date.now(),
                status: 'received',
                webhook_sent: false,
            })

            logger.info(`Message saved to database: ${key.id} from ${key.remoteJid}`)
            return savedMessage

        } catch (error) {
            logger.error(`Failed to save message to database:`, error)
            return null
        }
    }

    /**
     * Marca mensagem como enviada para webhook
     */
    static async markMessageWebhookSent(messageId) {
        if (!postgresEnabled) {
            return false
        }

        try {
            await Message.update({
                webhook_sent: true,
                webhook_sent_at: new Date(),
            }, {
                where: { id: messageId }
            })
            return true
        } catch (error) {
            logger.error(`Failed to mark message as webhook sent:`, error)
            return false
        }
    }

    /**
     * Busca mensagens não enviadas para webhook
     */
    static async getPendingWebhookMessages(instanceKey, limit = 100) {
        if (!postgresEnabled) {
            return []
        }

        try {
            const messages = await Message.findAll({
                where: {
                    instance_key: instanceKey,
                    webhook_sent: false,
                },
                order: [['timestamp', 'ASC']],
                limit: limit,
            })
            return messages
        } catch (error) {
            logger.error(`Failed to get pending webhook messages:`, error)
            return []
        }
    }
}

module.exports = WebhookService
