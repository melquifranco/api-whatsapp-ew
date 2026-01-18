const dotenv = require('dotenv')
const logger = require('pino')()
dotenv.config()

const app = require('./config/express')
const config = require('./config/config')
const { sequelize, postgresEnabled } = require('./config/database')

const { Session } = require('./api/class/session')

let server

if (postgresEnabled) {
    sequelize.authenticate().then(() => {
        logger.info('Connected to PostgreSQL')
        return sequelize.sync()
    }).catch((error) => {
        logger.error('Failed to connect to PostgreSQL:', error)
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
