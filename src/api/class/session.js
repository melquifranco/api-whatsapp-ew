/* eslint-disable no-unsafe-optional-chaining */
const { WhatsAppInstance } = require('../class/instance')
const logger = require('pino')()
const config = require('../../config/config')
const connectToCluster = require('../helper/connectMongoClient')

class Session {
    async restoreSessions() {
        let restoredSessions = new Array()
        
        // Restaura instâncias do MongoDB
        if (!config.mongodb || !config.mongodb.enabled) {
            logger.info('MongoDB disabled, skipping session restoration')
            return restoredSessions
        }
        
        try {
            const mongoClient = await connectToCluster(config.mongodb.uri)
            const collection = mongoClient.db('whatsapp').collection('auth_info_baileys')
            
            // Busca todas as instâncias únicas (pelo prefixo instance_key)
            const docs = await collection.find({ _id: /^.*:creds$/ }).toArray()
            const instanceKeys = docs.map(doc => doc._id.replace(':creds', ''))
            
            logger.info(`Found ${instanceKeys.length} instance(s) to restore from MongoDB`)
            
            for (const key of instanceKeys) {
                try {
                    const instance = new WhatsAppInstance(key, false, null)
                    await instance.init()
                    global.WhatsAppInstances[key] = instance
                    restoredSessions.push(key)
                    logger.info(`Instance ${key} restored successfully`)
                } catch (error) {
                    logger.error(`Error restoring instance ${key}:`, error.message)
                }
            }
        } catch (error) {
            logger.error('Error restoring sessions from MongoDB:', error.message)
        }
        
        return restoredSessions
        
        /* CÓDIGO ORIGINAL COMENTADO - Pode ser reativado se necessário
        try {
            // Usa o mesmo caminho do postgresAuthState
            const authSessionsDir = process.env.AUTH_DIR || path.join(os.tmpdir(), 'whatsapp_auth')
            
            // Verifica se o diretório existe
            if (!fs.existsSync(authSessionsDir)) {
                logger.info('No auth_sessions directory found, skipping session restoration')
                return restoredSessions
            }

            // Lista todos os diretórios (cada um representa uma sessão)
            const sessionDirs = fs.readdirSync(authSessionsDir, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name)

            logger.info(`Found ${sessionDirs.length} session(s) to restore`)

            for (const key of sessionDirs) {
                try {
                    const webhook = !config.webhookEnabled
                        ? undefined
                        : config.webhookEnabled
                    const webhookUrl = !config.webhookUrl
                        ? undefined
                        : config.webhookUrl
                    
                    const instance = new WhatsAppInstance(
                        key,
                        webhook,
                        webhookUrl
                    )
                    await instance.init()
                    WhatsAppInstances[key] = instance
                    restoredSessions.push(key)
                    logger.info(`Session ${key} restored successfully`)
                } catch (error) {
                    logger.error(`Error restoring session ${key}:`, error)
                }
            }
        } catch (e) {
            logger.error('Error restoring sessions')
            logger.error(e)
        }
        return restoredSessions
        */
    }
}

exports.Session = Session
