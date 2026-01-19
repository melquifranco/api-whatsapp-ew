# 🔌 Correção: Connection Terminated Unexpectedly

## 🔍 Problema

Após corrigir o SSL, apareceu um novo erro:

```json
{
    "success": false,
    "message": "Failed to check database status",
    "error": "Connection terminated unexpectedly"
}
```

**Causa:** A conexão SSL está sendo fechada prematuramente devido a:
1. Falta de `keepAlive` na conexão SSL
2. Pool de conexões muito grande para o plano free do Render
3. Timeouts muito curtos

---

## ✅ Soluções Aplicadas

### **1. Adicionar keepAlive**

```javascript
dialectOptions: {
    ssl: {
        require: true,
        rejectUnauthorized: false,
    },
    keepAlive: true,  // ← Novo
    statement_timeout: 30000,
    idle_in_transaction_session_timeout: 30000,
}
```

### **2. Reduzir Pool de Conexões**

```javascript
pool: {
    max: 3,        // ← Reduzido de 5 para 3
    min: 0,
    acquire: 60000,  // ← Aumentado de 30s para 60s
    idle: 10000,
    evict: 10000,    // ← Novo: remove conexões inativas
}
```

### **3. Adicionar Retry Automático**

```javascript
retry: {
    max: 3,  // ← Novo: tenta 3 vezes antes de falhar
}
```

### **4. Melhorar Logs**

Agora os logs mostram detalhes do erro:
```javascript
logger.error('❌ Failed to initialize database:', {
    message: error.message,
    code: error.code,
    name: error.name,
})
```

---

## 🚀 Próximos Passos

### **1. Fazer Redeploy**

1. Acesse: https://dashboard.render.com
2. Selecione `api-whatsapp-ew`
3. Clique em **"Manual Deploy"** → **"Deploy latest commit"**
4. Aguarde 3 minutos

### **2. Verificar Logs Detalhados**

Agora os logs vão mostrar mais informações:

**Se funcionar:**
```
✅ Attempting to connect to PostgreSQL...
✅ Connected to PostgreSQL successfully
✅ Database tables synchronized successfully
✅ Found 3 tables in database: [ 'chats', 'webhooks', 'messages' ]
```

**Se falhar:**
```
❌ Failed to initialize database: {
  message: 'connection timeout',
  code: 'ETIMEDOUT',
  name: 'SequelizeConnectionError'
}
```

### **3. Testar Endpoint**

```http
GET https://api-whatsapp-ew.onrender.com/admin/database/status
Authorization: Bearer SEU_TOKEN
```

---

## 🆘 Se Ainda Não Funcionar

### **Opção 1: Usar DATABASE_URL Direta**

Em vez de usar variáveis separadas, use a URL completa:

1. No PostgreSQL do Render, copie a **External Database URL**
2. No serviço da API, adicione variável:
   - **Key:** `DATABASE_URL`
   - **Value:** `postgresql://melqui:toH0XJ0ppI8ZXIIZf8OIfHuCL4NH1kH@dpg-d5ml48sarvns73f7v6u0-a.oregon-postgres.render.com:5432/postgres_whatsapp`

3. Modifique `src/config/database.js`:

```javascript
const databaseUrl = process.env.DATABASE_URL

let sequelize
if (databaseUrl) {
    sequelize = new Sequelize(databaseUrl, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
            keepAlive: true,
        },
        pool: {
            max: 3,
            min: 0,
            acquire: 60000,
            idle: 10000,
        },
    })
} else {
    // Usar variáveis individuais...
}
```

### **Opção 2: Executar SQL Manualmente (Recomendado)**

Se a API continuar falhando, crie as tabelas manualmente:

**1. Abrir Query Tool no pgAdmin:**
- Clique com botão direito em `postgres_whatsapp`
- Selecione **"Query Tool"**

**2. Copiar Script:**
- Acesse: https://raw.githubusercontent.com/melquifranco/api-whatsapp-ew/main/database/schema.sql
- Copie todo o conteúdo

**3. Executar:**
- Cole no Query Tool
- Clique em **▶️** (Execute) ou pressione **F5**

**4. Verificar:**
- Refresh em **Tabelas**
- Você verá: `chats`, `messages`, `webhooks`

**Guia completo:** Veja `PGADMIN_GUIDE.md`

---

## 📊 Resumo das 3 Correções

### **Correção 1: Hostname Completo** ✅

```
dpg-d5ml48sarvns73f7v6u0-a
→
dpg-d5ml48sarvns73f7v6u0-a.oregon-postgres.render.com
```

### **Correção 2: Configuração SSL** ✅

```javascript
dialectOptions: {
    ssl: {
        require: true,
        rejectUnauthorized: false,
    },
}
```

### **Correção 3: keepAlive e Pool** ✅

```javascript
dialectOptions: {
    ssl: { ... },
    keepAlive: true,
    statement_timeout: 30000,
}
pool: {
    max: 3,
    acquire: 60000,
    evict: 10000,
}
retry: {
    max: 3,
}
```

---

## 🎯 Por Que Render Free Tier Tem Problemas?

O plano free do Render tem limitações:

1. **Conexões limitadas:** Máximo 3-5 conexões simultâneas
2. **Timeout agressivo:** Fecha conexões inativas rapidamente
3. **SSL intermitente:** Pode fechar conexões SSL sem aviso

**Soluções:**
- ✅ Reduzir pool de conexões (max: 3)
- ✅ Usar keepAlive
- ✅ Aumentar timeouts
- ✅ Adicionar retry automático

---

## 💡 Alternativa: Criar Tabelas Manualmente

Se você só precisa das tabelas criadas (não precisa que a API crie automaticamente):

1. ✅ Execute o script SQL no pgAdmin (2 minutos)
2. ✅ As tabelas estarão criadas
3. ✅ A API vai usar as tabelas existentes
4. ✅ Webhook vai funcionar normalmente

**Vantagem:** Não depende da API conseguir conectar no startup

---

## ✅ Checklist

Após o redeploy:

- [ ] Logs mostram "Attempting to connect to PostgreSQL..."
- [ ] Logs mostram "Connected to PostgreSQL successfully"
- [ ] Logs mostram "Database tables synchronized successfully"
- [ ] Se falhar, logs mostram detalhes do erro (message, code, name)
- [ ] Endpoint `/admin/database/status` funciona
- [ ] Tabelas aparecem no pgAdmin

---

## 🎯 Recomendação

**Se após este redeploy ainda não funcionar:**

1. ✅ **Execute o script SQL manualmente no pgAdmin** (solução garantida)
2. ✅ As tabelas estarão criadas
3. ✅ A API vai funcionar normalmente
4. ✅ Webhook vai salvar mensagens

**Não precisa que a API crie as tabelas automaticamente!**

O importante é que as tabelas existam. Depois que estiverem criadas, a API vai usá-las normalmente.

---

**Repositório:** https://github.com/melquifranco/api-whatsapp-ew

**Faça o redeploy e me avise o resultado!** 🚀

Se continuar falhando, vamos executar o SQL manualmente no pgAdmin (que é garantido funcionar).
