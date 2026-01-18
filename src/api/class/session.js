/* eslint-disable no-unsafe-optional-chaining */
const { WhatsAppInstance } = require('../class/instance')
const logger = require('pino')()
const config = require('../../config/config')
const fs = require('fs')
const path = require('path')
const os = require('os')

class Session {
    async restoreSessions() {
        let restoredSessions = new Array()
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
    }
}

exports.Session = Session
