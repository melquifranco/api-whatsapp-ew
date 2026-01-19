const express = require('express')
const router = express.Router()
const instanceRoutes = require('./instance.route')
const messageRoutes = require('./message.route')
const miscRoutes = require('./misc.route')
const groupRoutes = require('./group.route')
const webhookRoutes = require('./webhook.route')
const adminRoutes = require('./admin.route')

router.get('/status', (req, res) => res.send('OK'))
router.use('/instance', instanceRoutes)
router.use('/message', messageRoutes)
router.use('/group', groupRoutes)
router.use('/misc', miscRoutes)
router.use('/webhook', webhookRoutes)
router.use('/admin', adminRoutes)

module.exports = router
