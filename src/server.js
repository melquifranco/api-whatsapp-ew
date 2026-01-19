const dotenv = require('dotenv')
const logger = require('pino')()
dotenv.config()

const app = require('./config/express')
const config = require('./config/config')
const connectToCluster = require('./api/helper/connectMongoClient')

const { Session } = require('./api/class/session')

let server
let mongoClient

// Inicializa o banco de dados MongoDB
if (config.mongodb.enabled) {
    connectToCluster(config.mongodb.uri)
        .then((client) => {
            mongoClient = client
            logger.info('✅ MongoDB initialized successfully')
        })
        .catch((error) => {
            logger.error('❌ Failed to initialize MongoDB:', error.message)
            logger.warn('⚠️  Continuing without MongoDB - some features may not work')
        })
}

server = app.listen(config.port, async () => {
    logger.info(`Listening on port ${config.port}`)
    if (config.restoreSessionsOnStartup) {
        logger.info(`Restoring Sessions`)
        const session = new Session()
        let restoreSessions = await session.restoreSessions()
        logger.info(`${restoreSessions.length} Session(s) Restored`)
    }
})

const exitHandler = () => {
    if (mongoClient) {
        mongoClient.close()
    }
    if (server) {
        server.close(() => {
            logger.info('Server closed')
            process.exit(1)
        })
    } else {
        process.exit(1)
    }
}

const unexpectedErrorHandler = (error) => {
    logger.error(error)
    exitHandler()
}

process.on('uncaughtException', unexpectedErrorHandler)
process.on('unhandledRejection', unexpectedErrorHandler)

process.on('SIGTERM', () => {
    logger.info('SIGTERM received')
    if (server) {
        server.close()
    }
})

module.exports = server
