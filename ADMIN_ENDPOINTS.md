# 🔧 Endpoints de Administração do Banco de Dados

## 🎯 Visão Geral

Foram criados 4 novos endpoints para gerenciar o banco de dados PostgreSQL diretamente pela API.

**Base URL:** `https://api-whatsapp-ew.onrender.com`

**Autenticação:** Todos os endpoints requerem Bearer Token (se `PROTECT_ROUTES=true`)

---

## 📋 Endpoints Disponíveis

### 1. **GET /admin/database/status** ✅

Verifica o status do banco de dados.

**Retorna:**
- Status da conexão
- Lista de tabelas
- Lista de views
- Contagem de registros em cada tabela
- Informações de conexão

**Exemplo de Request:**

```http
GET /admin/database/status
Authorization: Bearer SEU_TOKEN
```

**Exemplo de Response:**

```json
{
  "success": true,
  "message": "PostgreSQL is connected",
  "enabled": true,
  "connection": {
    "host": "dpg-xxxxx.oregon-postgres.render.com",
    "port": 5432,
    "database": "postgres_whatsapp",
    "user": "postgres_whatsapp_user"
  },
  "tables": ["chats", "messages", "webhooks"],
  "views": ["instance_stats", "recent_messages", "webhook_status"],
  "record_counts": {
    "chats": 5,
    "messages": 123,
    "webhooks": 2
  },
  "total_tables": 3,
  "total_views": 3
}
```

**Se PostgreSQL estiver desabilitado:**

```json
{
  "success": false,
  "message": "PostgreSQL is disabled",
  "enabled": false,
  "hint": "Set POSTGRES_ENABLED=true in environment variables"
}
```

---

### 2. **POST /admin/database/init** 🚀

Inicializa o banco de dados (cria tabelas se não existirem).

**Características:**
- ✅ Cria tabelas se não existirem
- ✅ Não apaga dados existentes
- ✅ Seguro para usar em produção
- ✅ Cria índices e constraints

**Exemplo de Request:**

```http
POST /admin/database/init
Authorization: Bearer SEU_TOKEN
```

**Exemplo de Response:**

```json
{
  "success": true,
  "message": "Database initialized successfully",
  "tables": ["chats", "messages", "webhooks"],
  "total_tables": 3
}
```

**Uso no Postman:**

1. Método: **POST**
2. URL: `{{base_url}}/admin/database/init`
3. Headers:
   - `Authorization: Bearer {{api_token}}`
4. Body: (vazio)
5. Clique em **Send**

---

### 3. **POST /admin/database/reset** ⚠️

Reseta o banco de dados (DROP + CREATE).

**⚠️ ATENÇÃO: Apaga TODOS os dados!**

**Características:**
- ❌ Apaga todas as tabelas
- ✅ Recria do zero
- ⚠️ Requer confirmação
- ⚠️ Não use em produção com dados importantes

**Exemplo de Request:**

```http
POST /admin/database/reset
Authorization: Bearer SEU_TOKEN
Content-Type: application/json

{
  "confirm": "YES_DELETE_ALL_DATA"
}
```

**Exemplo de Response:**

```json
{
  "success": true,
  "message": "Database reset completed successfully",
  "warning": "All previous data has been deleted",
  "tables": ["chats", "messages", "webhooks"],
  "total_tables": 3
}
```

**Se não enviar confirmação:**

```json
{
  "success": false,
  "message": "Confirmation required",
  "hint": "Send { \"confirm\": \"YES_DELETE_ALL_DATA\" } in request body to confirm"
}
```

**Uso no Postman:**

1. Método: **POST**
2. URL: `{{base_url}}/admin/database/reset`
3. Headers:
   - `Authorization: Bearer {{api_token}}`
   - `Content-Type: application/json`
4. Body (raw JSON):
   ```json
   {
     "confirm": "YES_DELETE_ALL_DATA"
   }
   ```
5. Clique em **Send**

---

### 4. **POST /admin/database/query** 🔍

Executa uma query SQL customizada.

**Características:**
- ✅ Executa qualquer SELECT
- ✅ Previne queries perigosas (DROP DATABASE, etc)
- ✅ Útil para consultas rápidas
- ⚠️ Apenas SELECT é recomendado

**Exemplo de Request:**

```http
POST /admin/database/query
Authorization: Bearer SEU_TOKEN
Content-Type: application/json

{
  "query": "SELECT * FROM chats LIMIT 10"
}
```

**Exemplo de Response:**

```json
{
  "success": true,
  "message": "Query executed successfully",
  "rows": 10,
  "data": [
    {
      "id": 1,
      "instance_key": "test",
      "remote_jid": "5511999999999@s.whatsapp.net",
      "name": "João",
      "is_group": false,
      "created_at": "2025-01-18T12:00:00.000Z"
    }
  ]
}
```

**Queries bloqueadas:**

```json
{
  "success": false,
  "message": "Dangerous query detected",
  "blocked_keyword": "DROP DATABASE"
}
```

**Uso no Postman:**

1. Método: **POST**
2. URL: `{{base_url}}/admin/database/query`
3. Headers:
   - `Authorization: Bearer {{api_token}}`
   - `Content-Type: application/json`
4. Body (raw JSON):
   ```json
   {
     "query": "SELECT * FROM messages ORDER BY created_at DESC LIMIT 20"
   }
   ```
5. Clique em **Send**

---

## 🧪 Casos de Uso

### **Caso 1: Verificar se o banco está funcionando**

```http
GET /admin/database/status
```

Use para:
- ✅ Verificar conexão
- ✅ Ver quantas tabelas existem
- ✅ Ver quantos registros tem em cada tabela

---

### **Caso 2: Criar as tabelas pela primeira vez**

```http
POST /admin/database/init
```

Use quando:
- ✅ Acabou de fazer deploy
- ✅ As tabelas não existem
- ✅ Quer criar sem apagar dados

---

### **Caso 3: Recriar tudo do zero**

```http
POST /admin/database/reset
Body: { "confirm": "YES_DELETE_ALL_DATA" }
```

Use quando:
- ⚠️ Quer apagar tudo e começar do zero
- ⚠️ Estrutura das tabelas está errada
- ⚠️ Está em ambiente de teste

---

### **Caso 4: Consultar dados rapidamente**

```http
POST /admin/database/query
Body: { "query": "SELECT * FROM messages WHERE from_me = true LIMIT 10" }
```

Use para:
- ✅ Ver mensagens recentes
- ✅ Verificar webhooks configurados
- ✅ Contar registros
- ✅ Debugar problemas

---

## 📊 Exemplos de Queries Úteis

### **Ver últimas mensagens:**

```json
{
  "query": "SELECT * FROM messages ORDER BY created_at DESC LIMIT 20"
}
```

### **Contar mensagens por instância:**

```json
{
  "query": "SELECT instance_key, COUNT(*) as total FROM messages GROUP BY instance_key"
}
```

### **Ver webhooks configurados:**

```json
{
  "query": "SELECT instance_key, webhook_url, enabled, success_count, failure_count FROM webhooks"
}
```

### **Ver chats mais ativos:**

```json
{
  "query": "SELECT remote_jid, name, COUNT(*) as messages FROM messages m JOIN chats c ON m.remote_jid = c.remote_jid GROUP BY m.remote_jid, c.name ORDER BY messages DESC LIMIT 10"
}
```

### **Ver estatísticas por instância (usando view):**

```json
{
  "query": "SELECT * FROM instance_stats"
}
```

### **Ver status dos webhooks (usando view):**

```json
{
  "query": "SELECT * FROM webhook_status"
}
```

---

## 🔐 Segurança

### **Autenticação:**

Todos os endpoints são protegidos por Bearer Token (se `PROTECT_ROUTES=true`).

```http
Authorization: Bearer SEU_TOKEN
```

### **Queries Bloqueadas:**

O endpoint `/admin/database/query` bloqueia queries perigosas:
- ❌ `DROP DATABASE`
- ❌ `DROP SCHEMA`
- ❌ `TRUNCATE DATABASE`

### **Recomendações:**

1. ✅ Use apenas SELECT no endpoint `/query`
2. ✅ Nunca compartilhe seu Bearer Token
3. ⚠️ Use `/reset` apenas em desenvolvimento
4. ✅ Sempre faça backup antes de usar `/reset`

---

## 📦 Importar para o Postman

### **Passo 1: Criar Requests**

Crie uma nova pasta chamada **"Admin - Database"** no Postman.

### **Passo 2: Adicionar Requests**

#### **1. Database Status**
- Nome: `Get Database Status`
- Método: `GET`
- URL: `{{base_url}}/admin/database/status`
- Headers: `Authorization: Bearer {{api_token}}`

#### **2. Initialize Database**
- Nome: `Initialize Database`
- Método: `POST`
- URL: `{{base_url}}/admin/database/init`
- Headers: `Authorization: Bearer {{api_token}}`

#### **3. Reset Database**
- Nome: `Reset Database (⚠️ DANGER)`
- Método: `POST`
- URL: `{{base_url}}/admin/database/reset`
- Headers: 
  - `Authorization: Bearer {{api_token}}`
  - `Content-Type: application/json`
- Body (raw JSON):
  ```json
  {
    "confirm": "YES_DELETE_ALL_DATA"
  }
  ```

#### **4. Execute Query**
- Nome: `Execute Custom Query`
- Método: `POST`
- URL: `{{base_url}}/admin/database/query`
- Headers:
  - `Authorization: Bearer {{api_token}}`
  - `Content-Type: application/json`
- Body (raw JSON):
  ```json
  {
    "query": "SELECT * FROM chats LIMIT 10"
  }
  ```

---

## 🎯 Fluxo Recomendado

### **Primeira vez (banco vazio):**

1. ✅ `GET /admin/database/status` - Verificar status
2. ✅ `POST /admin/database/init` - Criar tabelas
3. ✅ `GET /admin/database/status` - Confirmar criação

### **Banco com estrutura errada:**

1. ⚠️ Fazer backup dos dados
2. ⚠️ `POST /admin/database/reset` - Recriar tudo
3. ✅ `GET /admin/database/status` - Confirmar

### **Consultar dados:**

1. ✅ `POST /admin/database/query` - Executar SELECT
2. ✅ Ver resultados

---

## 🆘 Troubleshooting

### ❌ Erro: "PostgreSQL is disabled"

**Solução:** Adicione `POSTGRES_ENABLED=true` nas variáveis de ambiente do Render.

### ❌ Erro: "Unauthorized"

**Solução:** Verifique se o Bearer Token está correto no header `Authorization`.

### ❌ Erro: "Failed to initialize database"

**Solução:** 
1. Verifique os logs do Render
2. Verifique se as variáveis de conexão estão corretas
3. Execute o script SQL manualmente no pgAdmin

### ❌ Erro: "Dangerous query detected"

**Solução:** Não use queries que contenham `DROP DATABASE`, `DROP SCHEMA`, etc.

---

## ✅ Próximos Passos

Após criar os endpoints:

1. ✅ Fazer commit e push
2. ✅ Redeploy no Render
3. ✅ Adicionar requests no Postman
4. ✅ Testar endpoint `/status`
5. ✅ Executar `/init` para criar tabelas
6. ✅ Verificar no pgAdmin

---

**Estes endpoints facilitam muito o gerenciamento do banco de dados sem precisar acessar o pgAdmin!** 🚀
