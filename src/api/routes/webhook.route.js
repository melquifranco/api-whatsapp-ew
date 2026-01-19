const router = require('express').Router()
const webhookController = require('../controllers/webhook.controller')

// Configurar webhook
router.post('/set', webhookController.setWebhook)

// Obter configuração de webhook
router.get('/get', webhookController.getWebhook)

// Remover webhook
router.delete('/remove', webhookController.removeWebhook)

// Testar webhook
router.get('/test', webhookController.testWebhook)

// Listar mensagens recebidas
router.get('/messages', webhookController.getMessages)

module.exports = router
