const { sequelize, postgresEnabled } = require('./database')
const logger = require('pino')()
const Chat = require('../api/models/chat.model')
const Webhook = require('../api/models/webhook.model')
const Message = require('../api/models/message.model')

/**
 * Aguarda um tempo em milissegundos
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Tenta conectar ao PostgreSQL com retry automático
 * Render Free Tier é instável e precisa de múltiplas tentativas
 */
async function connectWithRetry(maxRetries = 5, delayMs = 2000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            logger.info(`Attempting to connect to PostgreSQL (attempt ${attempt}/${maxRetries})...`)
            await sequelize.authenticate()
            logger.info(`✅ Connected to PostgreSQL successfully (attempt ${attempt}/${maxRetries})`)
            return true
        } catch (error) {
            logger.warn(`⚠️  Connection attempt ${attempt}/${maxRetries} failed:`, {
                message: error.message,
                code: error.code,
                name: error.name,
            })
            // Log completo do erro para debug
            logger.error('Full error details:', error)
            
            if (attempt < maxRetries) {
                logger.info(`Retrying in ${delayMs}ms...`)
                await sleep(delayMs)
            }
        }
    }
    
    logger.error(`❌ Failed to connect after ${maxRetries} attempts`)
    return false
}

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
        // Tenta conectar com retry automático (5 tentativas, 2s de delay)
        const connected = await connectWithRetry(5, 2000)
        
        if (!connected) {
            logger.error('❌ Could not establish connection to PostgreSQL')
            return
        }

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
        logger.error('❌ Failed to initialize database:', {
            message: error.message,
            code: error.code,
            name: error.name,
        })
        // Não lança o erro para não crashar o servidor
        // throw error
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
