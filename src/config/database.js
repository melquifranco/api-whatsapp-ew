const { Sequelize } = require('sequelize')
const logger = require('pino')()

// Database configuration
const POSTGRES_ENABLED = !!(
    process.env.POSTGRES_ENABLED && process.env.POSTGRES_ENABLED === 'true'
)

const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost'
const POSTGRES_PORT = process.env.POSTGRES_PORT || 5432
const POSTGRES_DB = process.env.POSTGRES_DB || 'whatsapp_api'
const POSTGRES_USER = process.env.POSTGRES_USER || 'postgres'
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'postgres'

// Sempre inicializa o Sequelize, mesmo se POSTGRES_ENABLED for false
// Isso evita erros de "Cannot read properties of null"
const sequelize = new Sequelize(POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, {
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    dialect: 'postgres',
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
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
