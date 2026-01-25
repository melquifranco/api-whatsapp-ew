const dotenv = require('dotenv')
const logger = require('pino')()
const mongoose = require('mongoose')
dotenv.config()

const app = require('./config/express')
const config = require('./config/config')
const connectToCluster = require('./api/helper/connectMongoClient')

const { Session } = require('./api/class/session')

let server
let mongoClient

// Inicializa o banco de dados MongoDB
if (config.mongodb.enabled) {
    // Conecta o MongoDB nativo (para auth state)
    connectToCluster(config.mongodb.uri)
        .then((client) => {
            mongoClient = client
            logger.info('✅ MongoDB native client initialized successfully')
        })
        .catch((error) => {
            logger.error('❌ Failed to initialize MongoDB native client:', error.message)
            logger.warn('⚠️  Continuing without MongoDB - some features may not work')
        })

    // Conecta o Mongoose (para webhooks e outros modelos)
    mongoose.connect(config.mongodb.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
    })
    .then(() => {
        logger.info('✅ Mongoose connected successfully')
    })
    .catch((error) => {
        logger.error('❌ Failed to connect Mongoose:', error.message)
        logger.warn('⚠️  Continuing without Mongoose - webhook features may not work')
    })

    // Event listeners para Mongoose
    mongoose.connection.on('connected', () => {
        logger.info('📡 Mongoose connection established')
    })

    mongoose.connection.on('error', (err) => {
        logger.error('❌ Mongoose connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
        logger.warn('⚠️  Mongoose disconnected')
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
    if (mongoose.connection.readyState === 1) {
        mongoose.connection.close()
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
