const { MongoClient } = require('mongodb')
const logger = require('pino')()

module.exports = async function connectToCluster(uri) {
    let mongoClient

    try {
        mongoClient = new MongoClient(uri)
        logger.info('STATE: Connecting to MongoDB Atlas...')
        await mongoClient.connect()
        logger.info('✅ STATE: Successfully connected to MongoDB Atlas')
        return mongoClient
    } catch (error) {
        logger.error('❌ STATE: Connection to MongoDB Atlas failed!', error)
        throw error
    }
}
