const { sequelize, postgresEnabled } = require('../../config/database')
const { initDatabase, resetDatabase } = require('../../config/init-database')
const logger = require('pino')()

/**
 * Verifica o status do banco de dados
 */
const getDatabaseStatus = async (req, res) => {
    try {
        if (!postgresEnabled) {
            return res.status(200).json({
                success: false,
                message: 'PostgreSQL is disabled',
                enabled: false,
                hint: 'Set POSTGRES_ENABLED=true in environment variables',
            })
        }

        // Testa conexão
        await sequelize.authenticate()

        // Lista tabelas
        const tables = await sequelize.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name",
            { type: sequelize.QueryTypes.SELECT }
        )

        // Lista views
        const views = await sequelize.query(
            "SELECT table_name as view_name FROM information_schema.views WHERE table_schema = 'public' ORDER BY table_name",
            { type: sequelize.QueryTypes.SELECT }
        )

        // Conta registros em cada tabela
        const counts = {}
        for (const { table_name } of tables) {
            try {
                const result = await sequelize.query(
                    `SELECT COUNT(*) as count FROM ${table_name}`,
                    { type: sequelize.QueryTypes.SELECT }
                )
                counts[table_name] = parseInt(result[0].count)
            } catch (error) {
                counts[table_name] = 'error'
            }
        }

        return res.status(200).json({
            success: true,
            message: 'PostgreSQL is connected',
            enabled: true,
            connection: {
                host: sequelize.config.host,
                port: sequelize.config.port,
                database: sequelize.config.database,
                user: sequelize.config.username,
            },
            tables: tables.map(t => t.table_name),
            views: views.map(v => v.view_name),
            record_counts: counts,
            total_tables: tables.length,
            total_views: views.length,
        })
    } catch (error) {
        logger.error('Database status check failed:', error)
        return res.status(500).json({
            success: false,
            message: 'Failed to check database status',
            error: error.message,
        })
    }
}

/**
 * Inicializa o banco de dados (cria tabelas se não existirem)
 */
const initializeDatabaseEndpoint = async (req, res) => {
    try {
        if (!postgresEnabled) {
            return res.status(400).json({
                success: false,
                message: 'PostgreSQL is disabled',
                hint: 'Set POSTGRES_ENABLED=true in environment variables',
            })
        }

        logger.info('Initializing database via endpoint...')
        await initDatabase()

        // Verifica tabelas criadas
        const tables = await sequelize.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name",
            { type: sequelize.QueryTypes.SELECT }
        )

        return res.status(200).json({
            success: true,
            message: 'Database initialized successfully',
            tables: tables.map(t => t.table_name),
            total_tables: tables.length,
        })
    } catch (error) {
        logger.error('Database initialization failed:', error)
        return res.status(500).json({
            success: false,
            message: 'Failed to initialize database',
            error: error.message,
        })
    }
}

/**
 * Reseta o banco de dados (DROP + CREATE)
 * ⚠️ CUIDADO: Apaga todos os dados!
 */
const resetDatabaseEndpoint = async (req, res) => {
    try {
        if (!postgresEnabled) {
            return res.status(400).json({
                success: false,
                message: 'PostgreSQL is disabled',
                hint: 'Set POSTGRES_ENABLED=true in environment variables',
            })
        }

        // Requer confirmação
        const { confirm } = req.body
        if (confirm !== 'YES_DELETE_ALL_DATA') {
            return res.status(400).json({
                success: false,
                message: 'Confirmation required',
                hint: 'Send { "confirm": "YES_DELETE_ALL_DATA" } in request body to confirm',
            })
        }

        logger.warn('⚠️  Resetting database via endpoint...')
        await resetDatabase()

        // Verifica tabelas criadas
        const tables = await sequelize.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name",
            { type: sequelize.QueryTypes.SELECT }
        )

        return res.status(200).json({
            success: true,
            message: 'Database reset completed successfully',
            warning: 'All previous data has been deleted',
            tables: tables.map(t => t.table_name),
            total_tables: tables.length,
        })
    } catch (error) {
        logger.error('Database reset failed:', error)
        return res.status(500).json({
            success: false,
            message: 'Failed to reset database',
            error: error.message,
        })
    }
}

/**
 * Executa uma query SQL customizada (apenas para admin)
 */
const executeQuery = async (req, res) => {
    try {
        if (!postgresEnabled) {
            return res.status(400).json({
                success: false,
                message: 'PostgreSQL is disabled',
            })
        }

        const { query } = req.body
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Query is required',
                hint: 'Send { "query": "SELECT * FROM chats LIMIT 10" } in request body',
            })
        }

        // Prevenir queries perigosas
        const dangerousKeywords = ['DROP DATABASE', 'DROP SCHEMA', 'TRUNCATE DATABASE']
        const upperQuery = query.toUpperCase()
        for (const keyword of dangerousKeywords) {
            if (upperQuery.includes(keyword)) {
                return res.status(403).json({
                    success: false,
                    message: 'Dangerous query detected',
                    blocked_keyword: keyword,
                })
            }
        }

        logger.info('Executing custom query:', query)
        const result = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT })

        return res.status(200).json({
            success: true,
            message: 'Query executed successfully',
            rows: result.length,
            data: result,
        })
    } catch (error) {
        logger.error('Query execution failed:', error)
        return res.status(500).json({
            success: false,
            message: 'Failed to execute query',
            error: error.message,
        })
    }
}

module.exports = {
    getDatabaseStatus,
    initializeDatabaseEndpoint,
    resetDatabaseEndpoint,
    executeQuery,
}
