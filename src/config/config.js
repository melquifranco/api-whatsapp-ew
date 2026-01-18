// Port number
const PORT = process.env.PORT || '3333'
const TOKEN = process.env.TOKEN || ''
const PROTECT_ROUTES = !!(
    process.env.PROTECT_ROUTES && process.env.PROTECT_ROUTES === 'true'
)

const RESTORE_SESSIONS_ON_START_UP = !!(
    process.env.RESTORE_SESSIONS_ON_START_UP &&
    process.env.RESTORE_SESSIONS_ON_START_UP === 'true'
)

const APP_URL = process.env.APP_URL || false

const LOG_LEVEL = process.env.LOG_LEVEL || 'info'

const INSTANCE_MAX_RETRY_QR = process.env.INSTANCE_MAX_RETRY_QR || 2

const CLIENT_PLATFORM = process.env.CLIENT_PLATFORM || 'Whatsapp MD'
const CLIENT_BROWSER = process.env.CLIENT_BROWSER || 'Chrome'
const CLIENT_VERSION = process.env.CLIENT_VERSION || '4.0.0'

// Enable or disable PostgreSQL
const POSTGRES_ENABLED = !!(
    process.env.POSTGRES_ENABLED && process.env.POSTGRES_ENABLED === 'true'
)
// PostgreSQL Configuration
const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost'
const POSTGRES_PORT = process.env.POSTGRES_PORT || 5432
const POSTGRES_DB = process.env.POSTGRES_DB || 'whatsapp_api'
const POSTGRES_USER = process.env.POSTGRES_USER || 'postgres'
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'postgres'
// Enable or disable webhook globally on project
const WEBHOOK_ENABLED = !!(
    process.env.WEBHOOK_ENABLED && process.env.WEBHOOK_ENABLED === 'true'
)
// Webhook URL
const WEBHOOK_URL = process.env.WEBHOOK_URL
// Receive message content in webhook (Base64 format)
const WEBHOOK_BASE64 = !!(
    process.env.WEBHOOK_BASE64 && process.env.WEBHOOK_BASE64 === 'true'
)
// allowed events which should be sent to webhook
const WEBHOOK_ALLOWED_EVENTS = process.env.WEBHOOK_ALLOWED_EVENTS?.split(',') || ['all']
// Mark messages as seen
const MARK_MESSAGES_READ = !!(
    process.env.MARK_MESSAGES_READ && process.env.MARK_MESSAGES_READ === 'true'
)

module.exports = {
    port: PORT,
    token: TOKEN,
    restoreSessionsOnStartup: RESTORE_SESSIONS_ON_START_UP,
    appUrl: APP_URL,
    log: {
        level: LOG_LEVEL,
    },
    instance: {
        maxRetryQr: INSTANCE_MAX_RETRY_QR,
    },
    postgres: {
        enabled: POSTGRES_ENABLED,
        host: POSTGRES_HOST,
        port: POSTGRES_PORT,
        database: POSTGRES_DB,
        user: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
    },
    browser: {
        platform: CLIENT_PLATFORM,
        browser: CLIENT_BROWSER,
        version: CLIENT_VERSION,
    },
    webhookEnabled: WEBHOOK_ENABLED,
    webhookUrl: WEBHOOK_URL,
    webhookBase64: WEBHOOK_BASE64,
    protectRoutes: PROTECT_ROUTES,
    markMessagesRead: MARK_MESSAGES_READ,
    webhookAllowedEvents: WEBHOOK_ALLOWED_EVENTS,
    postgresEnabled: POSTGRES_ENABLED,
}
