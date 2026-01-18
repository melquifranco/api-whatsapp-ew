const { useMultiFileAuthState } = require('@whiskeysockets/baileys')
const path = require('path')
const fs = require('fs')
const os = require('os')

/**
 * Usa autenticação baseada em arquivos para cada instância
 * Os arquivos são salvos em /tmp/auth_sessions/{key} (compatível com Render.com)
 */
async function usePostgresAuthState(key) {
    // Usa /tmp para compatibilidade com ambientes como Render.com
    // onde o diretório de trabalho pode não ter permissões de escrita
    const baseDir = process.env.AUTH_DIR || path.join(os.tmpdir(), 'whatsapp_auth')
    const authDir = path.join(baseDir, key)
    
    try {
        // Cria o diretório se não existir
        if (!fs.existsSync(authDir)) {
            fs.mkdirSync(authDir, { recursive: true, mode: 0o755 })
            console.log(`Created new auth directory for instance ${key}`)
        } else {
            console.log(`Using existing auth directory for instance ${key}`)
            
            // Verificar se existem arquivos corrompidos
            const files = fs.readdirSync(authDir)
            if (files.length > 0) {
                console.log(`Found ${files.length} auth files for instance ${key}`)
            }
        }
    } catch (error) {
        console.error(`Error creating auth directory: ${error.message}`)
        throw new Error(`Failed to create auth directory: ${error.message}`)
    }
    
    return await useMultiFileAuthState(authDir)
}

module.exports = usePostgresAuthState
