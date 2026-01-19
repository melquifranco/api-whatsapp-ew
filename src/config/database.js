const { Sequelize } = require('sequelize')
const logger = require('pino')()

// Database configuration
const POSTGRES_ENABLED = !!(
    process.env.POSTGRES_ENABLED && process.env.POSTGRES_ENABLED === 'true'
)

// Prioridade 1: DATABASE_URL (mais confiável no Render)
const DATABASE_URL = process.env.DATABASE_URL

// Prioridade 2: Variáveis individuais
// Render usa: Database, Hostname, Username, Password, Port
// Padrão: POSTGRES_DB, POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_PORT
const POSTGRES_HOST = process.env.POSTGRES_HOST || process.env.Hostname || 'localhost'
const POSTGRES_PORT = process.env.POSTGRES_PORT || process.env.Port || 5432
const POSTGRES_DB = process.env.POSTGRES_DB || process.env.Database || 'whatsapp_api'
const POSTGRES_USER = process.env.POSTGRES_USER || process.env.Username || 'postgres'
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || process.env.Password || 'postgres'

// Log das configurações (sem senha)
if (POSTGRES_ENABLED) {
    if (DATABASE_URL) {
        logger.info('PostgreSQL Configuration: Using DATABASE_URL')
    } else {
        logger.info('PostgreSQL Configuration:', {
            enabled: POSTGRES_ENABLED,
            host: POSTGRES_HOST,
            port: POSTGRES_PORT,
            database: POSTGRES_DB,
            user: POSTGRES_USER,
            password_set: !!POSTGRES_PASSWORD,
        })
    }
}

// Inicializa Sequelize
let sequelize

if (DATABASE_URL) {
    // Usar DATABASE_URL (mais confiável no Render)
    logger.info('Initializing Sequelize with DATABASE_URL')
    sequelize = new Sequelize(DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
            keepAlive: true,
            statement_timeout: 30000,
            idle_in_transaction_session_timeout: 30000,
        },
        pool: {
            max: 3,
            min: 0,
            acquire: 60000,
            idle: 10000,
            evict: 10000,
        },
        retry: {
            max: 3,
        },
    })
} else {
    // Usar variáveis individuais
    logger.info('Initializing Sequelize with individual variables')
    sequelize = new Sequelize(POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, {
        host: POSTGRES_HOST,
        port: POSTGRES_PORT,
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
            keepAlive: true,
            statement_timeout: 30000,
            idle_in_transaction_session_timeout: 30000,
        },
        pool: {
            max: 3,
            min: 0,
            acquire: 60000,
            idle: 10000,
            evict: 10000,
        },
        retry: {
            max: 3,
        },
    })
}

module.exports = {
    sequelize,
    postgresEnabled: POSTGRES_ENABLED,
    postgresConfig: {
        host: POSTGRES_HOST,
        port: POSTGRES_PORT,
        database: POSTGRES_DB,
        user: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
    },
}
