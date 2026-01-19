# ⚙️ Configuração de Variáveis de Ambiente no Render

## 🎯 Problema Identificado

As tabelas não foram criadas automaticamente porque a variável `POSTGRES_ENABLED` não está configurada no Render.

**No log do deploy, não aparece:**
```
✅ Connected to PostgreSQL successfully
✅ Database tables synchronized successfully
```

Isso significa que o PostgreSQL está **desabilitado**.

---

## 🔧 Solução: Configurar Variáveis de Ambiente

### **Variáveis Necessárias**

Para que o PostgreSQL funcione, você precisa configurar estas variáveis no Render:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `POSTGRES_ENABLED` | `true` | **Obrigatória** - Habilita o PostgreSQL |
| `POSTGRES_HOST` | `dpg-xxx.oregon-postgres.render.com` | Host do banco (copie do Render) |
| `POSTGRES_PORT` | `5432` | Porta padrão |
| `POSTGRES_DB` | `postgres_whatsapp` | Nome do banco |
| `POSTGRES_USER` | `postgres_whatsapp_user` | Usuário do banco |
| `POSTGRES_PASSWORD` | `sua-senha` | Senha do banco |

---

## 📋 Como Obter os Valores

### **Passo 1: Acessar o Banco de Dados**

1. Acesse: https://dashboard.render.com
2. Vá em **Databases**
3. Clique no banco **postgres_whatsapp**

### **Passo 2: Copiar as Informações**

Na aba **Info**, você verá:

```
Hostname: dpg-xxxxx.oregon-postgres.render.com
Port: 5432
Database: postgres_whatsapp
Username: postgres_whatsapp_user
Password: ••••••••••••••••
```

**Clique em "Show" ao lado de Password** para ver a senha.

---

## 🚀 Como Adicionar no Render

### **Passo 1: Acessar o Serviço**

1. Vá em **Dashboard** → **Services**
2. Clique em **api-whatsapp-ew**

### **Passo 2: Adicionar Variáveis**

1. Clique na aba **Environment**
2. Role até **Environment Variables**
3. Clique em **"Add Environment Variable"**

### **Passo 3: Adicionar Cada Variável**

Adicione uma por vez:

#### **1. POSTGRES_ENABLED**
- **Key:** `POSTGRES_ENABLED`
- **Value:** `true`
- Clique em **"Add"**

#### **2. POSTGRES_HOST**
- **Key:** `POSTGRES_HOST`
- **Value:** `dpg-xxxxx.oregon-postgres.render.com` (copie do banco)
- Clique em **"Add"**

#### **3. POSTGRES_PORT**
- **Key:** `POSTGRES_PORT`
- **Value:** `5432`
- Clique em **"Add"**

#### **4. POSTGRES_DB**
- **Key:** `POSTGRES_DB`
- **Value:** `postgres_whatsapp` (nome do seu banco)
- Clique em **"Add"**

#### **5. POSTGRES_USER**
- **Key:** `POSTGRES_USER`
- **Value:** `postgres_whatsapp_user` (usuário do seu banco)
- Clique em **"Add"**

#### **6. POSTGRES_PASSWORD**
- **Key:** `POSTGRES_PASSWORD`
- **Value:** `sua-senha-aqui` (copie do banco)
- Clique em **"Add"**

### **Passo 4: Salvar**

1. Clique em **"Save Changes"**
2. O Render vai fazer **redeploy automático**
3. Aguarde 2-3 minutos

---

## ✅ Verificar se Funcionou

### **Passo 1: Ver os Logs**

1. Vá na aba **Logs**
2. Procure por estas mensagens:

```
✅ Connected to PostgreSQL successfully
✅ Database tables synchronized successfully
✅ Found 3 tables in database: [ 'chats', 'webhooks', 'messages' ]
```

Se aparecer essas mensagens, **está tudo certo!** ✅

### **Passo 2: Verificar no Banco**

No pgAdmin, execute:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Deve mostrar:
- ✅ `chats`
- ✅ `messages`
- ✅ `webhooks`

---

## 🔄 Alternativa: Usar DATABASE_URL

Se você já tem a variável `DATABASE_URL` configurada, pode usá-la diretamente.

### **Formato da DATABASE_URL:**

```
postgresql://usuario:senha@host:5432/database
```

**Exemplo:**
```
postgresql://postgres_whatsapp_user:abc123@dpg-xxxxx.oregon-postgres.render.com:5432/postgres_whatsapp
```

### **Como configurar:**

1. Adicione apenas 2 variáveis:
   - `POSTGRES_ENABLED=true`
   - `DATABASE_URL=postgresql://...` (copie do Render)

2. Modifique o código em `src/config/database.js`:

```javascript
// Se DATABASE_URL estiver definida, use ela
const databaseUrl = process.env.DATABASE_URL

let sequelize
if (databaseUrl) {
    sequelize = new Sequelize(databaseUrl, {
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    })
} else {
    // Usar variáveis individuais
    sequelize = new Sequelize(POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, {
        host: POSTGRES_HOST,
        port: POSTGRES_PORT,
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    })
}
```

---

## 🎯 Variáveis Opcionais

Além das variáveis do PostgreSQL, você pode configurar:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `DATABASE_RESET` | `true` | Forçar recriação das tabelas (⚠️ apaga dados!) |
| `AUTH_DIR` | `/data/whatsapp_auth` | Diretório de sessões (se usar Persistent Disk) |
| `LOG_LEVEL` | `info` | Nível de log (debug, info, warn, error) |

---

## 📊 Resumo das Variáveis

Após configurar, você terá:

```
POSTGRES_ENABLED=true
POSTGRES_HOST=dpg-xxxxx.oregon-postgres.render.com
POSTGRES_PORT=5432
POSTGRES_DB=postgres_whatsapp
POSTGRES_USER=postgres_whatsapp_user
POSTGRES_PASSWORD=sua-senha
```

Ou simplesmente:

```
POSTGRES_ENABLED=true
DATABASE_URL=postgresql://user:pass@host:5432/db
```

---

## 🆘 Troubleshooting

### ❌ Erro: "Connection refused"

**Causa:** Host ou porta incorretos

**Solução:**
1. Verifique o hostname no Render Database
2. Certifique-se de usar o **External Connection** (não o Internal)

---

### ❌ Erro: "password authentication failed"

**Causa:** Senha incorreta

**Solução:**
1. Vá no Render Database → Info
2. Clique em "Show" ao lado de Password
3. Copie a senha correta
4. Atualize a variável `POSTGRES_PASSWORD`

---

### ❌ Logs não mostram mensagens do PostgreSQL

**Causa:** `POSTGRES_ENABLED` não está como `true`

**Solução:**
1. Verifique se a variável está exatamente como: `POSTGRES_ENABLED=true`
2. Não use `True`, `TRUE`, `1`, etc. - deve ser `true` (minúsculo)

---

### ❌ Tabelas não foram criadas

**Solução 1:** Execute o script SQL manualmente (veja `PGADMIN_GUIDE.md`)

**Solução 2:** Use `DATABASE_RESET=true`:
1. Adicione a variável `DATABASE_RESET=true`
2. Aguarde redeploy
3. **Remova** a variável `DATABASE_RESET=true`
4. Aguarde outro redeploy

---

## ✅ Checklist Final

Após configurar:

- [ ] Variável `POSTGRES_ENABLED=true` adicionada
- [ ] Variáveis de conexão configuradas (HOST, PORT, DB, USER, PASSWORD)
- [ ] Redeploy completado
- [ ] Logs mostram "Connected to PostgreSQL successfully"
- [ ] Logs mostram "Database tables synchronized successfully"
- [ ] Tabelas aparecem no pgAdmin
- [ ] API responde normalmente

---

## 🎯 Próximos Passos

Após configurar as variáveis:

1. ✅ Aguardar redeploy automático
2. ✅ Verificar logs
3. ✅ Testar endpoints de webhook
4. ✅ Enviar mensagem de teste
5. ✅ Verificar se foi salva no banco

---

## 💡 Dica

**Sempre use o External Connection** do Render Database, não o Internal.

O Internal só funciona para serviços dentro do mesmo datacenter do Render.

---

**Precisa de ajuda?** Verifique os logs do Render ou me avise!
