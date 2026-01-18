const { useMultiFileAuthState } = require('@whiskeysockets/baileys')
const path = require('path')
const fs = require('fs')

/**
 * Usa autenticação baseada em arquivos para cada instância
 * Os arquivos são salvos em ./auth_sessions/{key}
 */
async function usePostgresAuthState(key) {
    const authDir = path.join(process.cwd(), 'auth_sessions', key)
    
    // Cria o diretório se não existir
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true })
    }
    
    return await useMultiFileAuthState(authDir)
}

module.exports = usePostgresAuthState
