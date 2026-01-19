const express = require('express')
const router = express.Router()
const adminController = require('../controllers/admin.controller')

/**
 * Rotas de administração do banco de dados
 * Todas as rotas são protegidas por autenticação (se PROTECT_ROUTES=true)
 */

/**
 * GET /admin/database/status
 * Verifica o status do banco de dados
 * Retorna: conexão, tabelas, views, contagem de registros
 */
router.get('/database/status', adminController.getDatabaseStatus)

/**
 * POST /admin/database/init
 * Inicializa o banco de dados (cria tabelas se não existirem)
 * Não apaga dados existentes
 */
router.post('/database/init', adminController.initializeDatabaseEndpoint)

/**
 * POST /admin/database/reset
 * Reseta o banco de dados (DROP + CREATE)
 * ⚠️ CUIDADO: Apaga todos os dados!
 * Requer: { "confirm": "YES_DELETE_ALL_DATA" }
 */
router.post('/database/reset', adminController.resetDatabaseEndpoint)

/**
 * POST /admin/database/query
 * Executa uma query SQL customizada
 * Body: { "query": "SELECT * FROM chats LIMIT 10" }
 * Previne queries perigosas (DROP DATABASE, etc)
 */
router.post('/database/query', adminController.executeQuery)

module.exports = router
