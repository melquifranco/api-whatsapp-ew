const { Sequelize } = require('sequelize')
const logger = require('pino')()

// Database configuration
const POSTGRES_ENABLED = !!(
    process.env.POSTGRES_ENABLED && process.env.POSTGRES_ENABLED === 'true'
)

// Suporta múltiplos formatos de variáveis de ambiente
// Render usa: Database, Hostname, Username, Password, Port
// Padrão: POSTGRES_DB, POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_PORT
const POSTGRES_HOST = process.env.POSTGRES_HOST || process.env.Hostname || 'localhost'
const POSTGRES_PORT = process.env.POSTGRES_PORT || process.env.Port || 5432
const POSTGRES_DB = process.env.POSTGRES_DB || process.env.Database || 'whatsapp_api'
const POSTGRES_USER = process.env.POSTGRES_USER || process.env.Username || 'postgres'
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || process.env.Password || 'postgres'

// Log das configurações (sem senha)
if (POSTGRES_ENABLED) {
    logger.info('PostgreSQL Configuration:', {
        enabled: POSTGRES_ENABLED,
        host: POSTGRES_HOST,
        port: POSTGRES_PORT,
        database: POSTGRES_DB,
        user: POSTGRES_USER,
        password_set: !!POSTGRES_PASSWORD,
    })
}

// Sempre inicializa o Sequelize, mesmo se POSTGRES_ENABLED for false
// Isso evita erros de "Cannot read properties of null"
const sequelize = new Sequelize(POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, {
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    dialect: 'postgres',
    logging: false,
    // SSL/TLS configuration for Render PostgreSQL
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false, // Render uses self-signed certificates
        },
        // Prevent connection timeout
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
