# Correções para Deploy no Render.com

## Problemas Identificados e Soluções

### Problema 1: `TypeError: Cannot read properties of null (reading 'define')`

**Causa:** O objeto `sequelize` estava sendo inicializado como `null` quando `POSTGRES_ENABLED` era `false`, mas o modelo `Chat` tentava usar `sequelize.define()` independentemente dessa condição.

**Solução:** O Sequelize agora é sempre inicializado, independentemente da variável `POSTGRES_ENABLED`. Isso garante que o objeto nunca seja `null`.

```javascript
// Antes (em database.js)
let sequelize = null
if (POSTGRES_ENABLED) {
    sequelize = new Sequelize(...)
}

// Depois
const sequelize = new Sequelize(...) // Sempre inicializado
```

### Problema 2: Dependência do MongoDB Removida

**Causa:** O código ainda referenciava `mongoClient`, `mongoAuthState` e outras funções do MongoDB que foram removidas na migração para PostgreSQL.

**Solução:** 
1. Criado novo helper `postgresAuthState.js` que usa o sistema de arquivos para armazenar credenciais do WhatsApp
2. Atualizado `instance.js` para usar `usePostgresAuthState` em vez de `useMongoDBAuthState`
3. Atualizado `session.js` para restaurar sessões do diretório `auth_sessions/` em vez do MongoDB
4. Atualizado `instance.controller.js` para listar instâncias do sistema de arquivos

### Arquivos Modificados

1. **src/config/database.js**
   - Sequelize sempre inicializado

2. **src/api/helper/postgresAuthState.js** (novo)
   - Sistema de autenticação baseado em arquivos

3. **src/api/class/instance.js**
   - Usa `postgresAuthState` em vez de `mongoAuthState`
   - Remove referência a `mongoClient`

4. **src/api/class/session.js**
   - Restaura sessões do diretório `auth_sessions/`

5. **src/api/controllers/instance.controller.js**
   - Lista instâncias do sistema de arquivos

6. **.gitignore**
   - Adiciona `auth_sessions/` para não versionar credenciais

## Como Funciona Agora

### Armazenamento de Sessões WhatsApp

As sessões do WhatsApp (credenciais de autenticação) são armazenadas em:
```
auth_sessions/
├── instancia-1/
│   ├── creds.json
│   └── ...
├── instancia-2/
│   ├── creds.json
│   └── ...
```

**Importante:** No Render.com, o sistema de arquivos é efêmero. Isso significa que:
- ✅ As sessões funcionarão durante a execução
- ⚠️ As sessões serão perdidas ao reiniciar o serviço
- 💡 Para persistência, considere usar volumes persistentes do Render ou armazenar as credenciais no PostgreSQL (implementação futura)

### PostgreSQL

O PostgreSQL está configurado e pronto para uso. Atualmente, o modelo `Chat` está disponível para armazenar dados de conversas.

## Próximos Passos no Render

1. **Fazer Redeploy Manual**
   - Acesse o dashboard do Render
   - Vá até o seu Web Service
   - Clique em "Manual Deploy" → "Deploy latest commit"

2. **Verificar Logs**
   - Após o deploy, verifique os logs
   - Deve aparecer: `Connected to PostgreSQL` e `Listening on port 3333`

3. **Testar a API**
   - Acesse: `https://seu-app.onrender.com/instance/init`
   - Deve retornar uma chave de instância

## Persistência de Sessões (Opcional)

Se você precisar que as sessões persistam entre restarts, há duas opções:

### Opção 1: Render Disks (Recomendado)
- Adicione um Persistent Disk no Render
- Monte em `/home/node/app/auth_sessions`
- Custo adicional, mas simples de implementar

### Opção 2: Armazenar no PostgreSQL
- Modificar `postgresAuthState.js` para salvar credenciais no banco
- Mais complexo, mas sem custo adicional
- Requer implementação customizada

## Variáveis de Ambiente Necessárias

Certifique-se de que estas variáveis estão configuradas no Render:

```env
TOKEN=seu_token_secreto_aqui
PROTECT_ROUTES=true
POSTGRES_ENABLED=true
POSTGRES_HOST=seu-host-postgres.render.com
POSTGRES_PORT=5432
POSTGRES_DB=nome_do_banco
POSTGRES_USER=usuario
POSTGRES_PASSWORD=senha_segura
APP_URL=https://seu-app.onrender.com
```

## Suporte

Se encontrar problemas:
1. Verifique os logs do Render
2. Confirme que todas as variáveis de ambiente estão configuradas
3. Teste a conexão com o PostgreSQL separadamente
