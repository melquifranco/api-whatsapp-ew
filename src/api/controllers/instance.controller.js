const { WhatsAppInstance } = require('../class/instance')
const fs = require('fs')
const path = require('path')
const os = require('os')
const config = require('../../config/config')
const { Session } = require('../class/session')

exports.init = async (req, res) => {
    const key = req.query.key
    const webhook = !req.query.webhook ? false : req.query.webhook
    const webhookUrl = !req.query.webhookUrl ? null : req.query.webhookUrl
    const appUrl = config.appUrl || req.protocol + '://' + req.headers.host
    const instance = new WhatsAppInstance(key, webhook, webhookUrl)
    const data = await instance.init()
    WhatsAppInstances[data.key] = instance
    res.json({
        error: false,
        message: 'Initializing successfully',
        key: data.key,
        webhook: {
            enabled: webhook,
            webhookUrl: webhookUrl,
        },
        qrcode: {
            url: appUrl + '/instance/qr?key=' + data.key,
        },
        browser: config.browser,
    })
}

exports.qr = async (req, res) => {
    try {
        const instance = WhatsAppInstances[req.query.key]
        if (!instance) {
            return res.status(404).send('<h1>Instance not found</h1><p>Please initialize the instance first using /instance/init</p>')
        }
        
        const qrcode = instance.instance.qr || ''
        res.render('qrcode', {
            qrcode: qrcode,
        })
    } catch (error) {
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`)
    }
}

exports.qrbase64 = async (req, res) => {
    try {
        const instance = WhatsAppInstances[req.query.key]
        if (!instance) {
            return res.status(404).json({
                error: true,
                message: 'Instance not found',
                qrcode: ''
            })
        }
        
        const qrcode = instance.instance.qr || ''
        
        res.json({
            error: false,
            message: qrcode ? 'QR Base64 fetched successfully' : 'QR Code not generated yet, please wait a few seconds and try again',
            qrcode: qrcode,
        })
    } catch (error) {
        res.json({
            error: true,
            message: error.message,
            qrcode: '',
        })
    }
}

exports.info = async (req, res) => {
    const instance = WhatsAppInstances[req.query.key]
    let data
    try {
        data = await instance.getInstanceDetail(req.query.key)
    } catch (error) {
        data = {}
    }
    return res.json({
        error: false,
        message: 'Instance fetched successfully',
        instance_data: data,
    })
}

exports.restore = async (req, res, next) => {
    try {
        const session = new Session()
        let restoredSessions = await session.restoreSessions()
        return res.json({
            error: false,
            message: 'All instances restored',
            data: restoredSessions,
        })
    } catch (error) {
        next(error)
    }
}

exports.logout = async (req, res) => {
    let errormsg
    try {
        await WhatsAppInstances[req.query.key].instance?.sock?.logout()
    } catch (error) {
        errormsg = error
    }
    return res.json({
        error: false,
        message: 'logout successfull',
        errormsg: errormsg ? errormsg : null,
    })
}

exports.delete = async (req, res) => {
    let errormsg
    try {
        await WhatsAppInstances[req.query.key].deleteInstance(req.query.key)
        delete WhatsAppInstances[req.query.key]
    } catch (error) {
        errormsg = error
    }
    return res.json({
        error: false,
        message: 'Instance deleted successfully',
        data: errormsg ? errormsg : null,
    })
}

exports.list = async (req, res) => {
    if (req.query.active) {
        let instance = []
        try {
            // Usa o mesmo caminho do postgresAuthState
            const authSessionsDir = process.env.AUTH_DIR || path.join(os.tmpdir(), 'whatsapp_auth')
            if (fs.existsSync(authSessionsDir)) {
                const sessionDirs = fs.readdirSync(authSessionsDir, { withFileTypes: true })
                    .filter(dirent => dirent.isDirectory())
                    .map(dirent => dirent.name)
                instance = sessionDirs
            }
        } catch (error) {
            console.error('Error listing sessions:', error)
        }

        return res.json({
            error: false,
            message: 'All active instance',
            data: instance,
        })
    }

    let instance = Object.keys(WhatsAppInstances).map(async (key) =>
        WhatsAppInstances[key].getInstanceDetail(key)
    )
    let data = await Promise.all(instance)
    
    return res.json({
        error: false,
        message: 'All instance listed',
        data: data,
    })
}
