# 🔒 Correção: SSL/TLS Required

## 🔍 Problema Identificado

Após corrigir o hostname, um novo erro apareceu:

```json
{
    "success": false,
    "message": "Failed to initialize database",
    "error": "SSL/TLS required"
}
```

**Causa:** O PostgreSQL do Render **exige conexão SSL**, mas o Sequelize não estava configurado para usar SSL.

---

## ✅ Solução Aplicada

Atualizei o arquivo `src/config/database.js` para incluir configuração SSL:

```javascript
const sequelize = new Sequelize(POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, {
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    dialect: 'postgres',
    logging: false,
    // SSL/TLS configuration for Render PostgreSQL
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false, // Render uses self-signed certificates
        },
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
})
```

### **O Que Foi Adicionado:**

```javascript
dialectOptions: {
    ssl: {
        require: true,              // Exige SSL
        rejectUnauthorized: false,  // Aceita certificados self-signed
    },
}
```

---

## 🎯 Por Que `rejectUnauthorized: false`?

O Render PostgreSQL usa **certificados self-signed** (auto-assinados), não certificados de uma CA (Certificate Authority) reconhecida.

Se usar `rejectUnauthorized: true`, o Node.js vai rejeitar a conexão porque não consegue verificar o certificado.

**Opções:**

1. ✅ **`rejectUnauthorized: false`** (recomendado para Render)
   - Aceita certificados self-signed
   - Conexão ainda é criptografada (SSL/TLS)
   - Seguro para uso em produção no Render

2. ❌ **`rejectUnauthorized: true`** (não funciona no Render)
   - Só aceita certificados de CA reconhecida
   - Vai falhar no Render

3. ⚠️ **Usar certificado CA do Render** (complexo)
   - Baixar o certificado CA do Render
   - Configurar `ca: fs.readFileSync('path/to/ca.crt')`
   - Desnecessário para a maioria dos casos

---

## 🚀 Como Aplicar

### **Passo 1: Fazer Redeploy**

1. Acesse: https://dashboard.render.com
2. Selecione `api-whatsapp-ew`
3. Clique em **"Manual Deploy"** → **"Deploy latest commit"**
4. Aguarde 3 minutos

### **Passo 2: Verificar Logs**

Procure por:

```
✅ PostgreSQL Configuration: { ... }
✅ Connected to PostgreSQL successfully
✅ Database tables synchronized successfully
✅ Found 3 tables in database: [ 'chats', 'webhooks', 'messages' ]
```

### **Passo 3: Testar Endpoint**

```http
GET https://api-whatsapp-ew.onrender.com/admin/database/status
Authorization: Bearer SEU_TOKEN
```

Deve retornar:
```json
{
  "success": true,
  "message": "PostgreSQL is connected",
  "tables": ["chats", "messages", "webhooks"]
}
```

---

## 🔍 Verificar no pgAdmin

Após o redeploy:

1. Refresh em **Tabelas** (F5)
2. Expanda **Tabelas**
3. Você verá:
   - ✅ `chats`
   - ✅ `messages`
   - ✅ `webhooks`

---

## 📊 Resumo das Correções

Foram necessárias **2 correções**:

### **Correção 1: Hostname Completo**

❌ **Antes:**
```
Hostname = dpg-d5ml48sarvns73f7v6u0-a
```

✅ **Depois:**
```
Hostname = dpg-d5ml48sarvns73f7v6u0-a.oregon-postgres.render.com
```

### **Correção 2: Configuração SSL**

❌ **Antes:**
```javascript
const sequelize = new Sequelize(POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, {
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    dialect: 'postgres',
    logging: false,
})
```

✅ **Depois:**
```javascript
const sequelize = new Sequelize(POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, {
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
})
```

---

## 🎉 Resultado Esperado

Após o redeploy com as 2 correções:

1. ✅ API conecta no PostgreSQL com SSL
2. ✅ Tabelas são criadas automaticamente
3. ✅ Webhook funciona
4. ✅ Mensagens são salvas no banco
5. ✅ Endpoints `/admin/database/*` funcionam

---

## 🆘 Se Ainda Não Funcionar

### **Opção 1: Ver Logs Detalhados**

No Render, vá em **Logs** e procure por erros específicos.

### **Opção 2: Executar SQL Manualmente**

Se a API não criar as tabelas, execute manualmente:

1. Abra Query Tool no pgAdmin
2. Copie o script: https://raw.githubusercontent.com/melquifranco/api-whatsapp-ew/main/database/schema.sql
3. Execute (F5)

Veja `PGADMIN_GUIDE.md` para detalhes.

### **Opção 3: Testar Conexão Localmente**

Teste se as credenciais estão corretas:

```bash
PGPASSWORD=toH0XJ0ppI8ZXIIZf8OIfHuCL4NH1kH psql -h dpg-d5ml48sarvns73f7v6u0-a.oregon-postgres.render.com -U melqui -d postgres_whatsapp -p 5432
```

Se conectar, as credenciais estão corretas.

---

## 📚 Documentação

Guias disponíveis:

1. **`SSL_FIX.md`** (este arquivo) - Correção SSL
2. **`QUICK_FIX.md`** - Correção do hostname
3. **`FIX_CREDENTIALS.md`** - Guia completo de credenciais
4. **`PGADMIN_GUIDE.md`** - Como usar pgAdmin
5. **`ADMIN_ENDPOINTS.md`** - Endpoints da API

---

## ✅ Checklist Final

Após o redeploy:

- [ ] Logs mostram "Connected to PostgreSQL successfully"
- [ ] Logs mostram "Database tables synchronized successfully"
- [ ] Endpoint `/admin/database/status` retorna `success: true`
- [ ] Tabelas aparecem no pgAdmin
- [ ] Não há mais erro "SSL/TLS required"

---

**Repositório atualizado:** https://github.com/melquifranco/api-whatsapp-ew

**Faça o redeploy e me avise se funcionou!** 🚀
