const { sequelize, postgresEnabled } = require('./database')
const logger = require('pino')()
const Chat = require('../api/models/chat.model')
const Webhook = require('../api/models/webhook.model')
const Message = require('../api/models/message.model')

/**
 * Inicializa o banco de dados PostgreSQL
 * Cria as tabelas se não existirem
 */
async function initDatabase() {
    if (!postgresEnabled) {
        logger.info('PostgreSQL is disabled, skipping database initialization')
        return
    }

    try {
        // Testa a conexão
        await sequelize.authenticate()
        logger.info('Connected to PostgreSQL successfully')

        // Sincroniza os modelos (cria tabelas se não existirem)
        // Usar force: true apenas se DATABASE_RESET=true estiver definido
        const forceSync = process.env.DATABASE_RESET === 'true'
        
        if (forceSync) {
            logger.warn('⚠️  DATABASE_RESET=true - Recreating all tables!')
            await sequelize.sync({ force: true })
        } else {
            await sequelize.sync({ alter: true })
        }
        
        logger.info('Database tables synchronized successfully')

        // Verifica se as tabelas foram criadas
        const tables = await sequelize.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
            { type: sequelize.QueryTypes.SELECT }
        )
        
        logger.info(`Found ${tables.length} tables in database:`, tables.map(t => t.table_name))

    } catch (error) {
        logger.error('Failed to initialize database:', error)
        throw error
    }
}

/**
 * Cria as tabelas forçadamente (DROP + CREATE)
 * CUIDADO: Isso vai apagar todos os dados!
 */
async function resetDatabase() {
    if (!postgresEnabled) {
        logger.warn('PostgreSQL is disabled, cannot reset database')
        return
    }

    try {
        logger.warn('⚠️  RESETTING DATABASE - ALL DATA WILL BE LOST!')
        
        await sequelize.authenticate()
        await sequelize.sync({ force: true })
        
        logger.info('✅ Database reset completed successfully')
    } catch (error) {
        logger.error('Failed to reset database:', error)
        throw error
    }
}

module.exports = {
    initDatabase,
    resetDatabase,
}
