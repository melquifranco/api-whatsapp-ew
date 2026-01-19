# 🐘 Guia: Como Executar o Script SQL no pgAdmin

## 🎯 Objetivo

Criar as tabelas `chats`, `webhooks` e `messages` no PostgreSQL usando o pgAdmin.

---

## 📋 Pré-requisitos

- ✅ pgAdmin instalado (você já tem, conforme a screenshot)
- ✅ Conexão com o banco `postgres_whatsapp` configurada
- ✅ Arquivo `schema.sql` (disponível no repositório)

---

## 🚀 Passo a Passo

### **Passo 1: Abrir o Query Tool**

Na sua screenshot, vejo que você está em:
```
Servers → postgres_whatsapp → Bancos de dados → postgres_whatsapp → Esquemas → public → Tabelas
```

**Para abrir o Query Tool:**

1. Clique com botão direito em **`postgres_whatsapp`** (o banco de dados)
2. Selecione **"Query Tool"** (ou **"Ferramenta de Consulta"** em português)

Ou use o atalho: **Alt + Shift + Q**

---

### **Passo 2: Copiar o Script SQL**

Você tem 2 opções:

#### **Opção A: Baixar do GitHub**

1. Acesse: https://raw.githubusercontent.com/melquifranco/api-whatsapp-ew/main/database/schema.sql
2. Pressione **Ctrl + A** (selecionar tudo)
3. Pressione **Ctrl + C** (copiar)

#### **Opção B: Usar o arquivo local**

Se você clonou o repositório:

1. Abra o arquivo `database/schema.sql`
2. Copie todo o conteúdo (**Ctrl + A** → **Ctrl + C**)

---

### **Passo 3: Colar no Query Tool**

1. No Query Tool do pgAdmin, cole o script (**Ctrl + V**)
2. Você verá um script SQL grande com comentários

---

### **Passo 4: Executar o Script**

**Clique no botão de executar (▶️)** ou pressione **F5**

Você verá mensagens como:
```
DROP TABLE
DROP TABLE
DROP TABLE
CREATE TABLE
CREATE INDEX
CREATE INDEX
...
```

---

### **Passo 5: Verificar as Tabelas Criadas**

Após executar, você verá no final do resultado:

```
table_name | column_count
-----------+-------------
chats      | 10
messages   | 17
webhooks   | 14
```

**Para ver as tabelas no pgAdmin:**

1. Volte para a árvore de navegação à esquerda
2. Clique com botão direito em **"Tabelas"**
3. Selecione **"Refresh"** (ou **"Atualizar"**)
4. Expanda **"Tabelas"**

Você deverá ver:
- ✅ **chats**
- ✅ **messages**
- ✅ **webhooks**

---

## 🔍 Como Ver a Estrutura das Tabelas

### **Ver colunas de uma tabela:**

1. Expanda **Tabelas** → **chats** → **Colunas**
2. Você verá todas as colunas: `id`, `instance_key`, `remote_jid`, etc.

### **Ver índices:**

1. Expanda **Tabelas** → **chats** → **Índices**
2. Você verá: `unique_chat`, `idx_chats_instance`, etc.

### **Ver constraints:**

1. Expanda **Tabelas** → **chats** → **Constraints**
2. Você verá a constraint única: `unique_chat`

---

## 🧪 Testar as Tabelas

Após criar, você pode testar inserindo dados.

### **Teste 1: Inserir um chat**

No Query Tool, execute:

```sql
INSERT INTO chats (instance_key, remote_jid, name, is_group) 
VALUES ('test', '5511999999999@s.whatsapp.net', 'Teste', false);

SELECT * FROM chats;
```

Você deverá ver o registro inserido.

---

### **Teste 2: Inserir um webhook**

```sql
INSERT INTO webhooks (instance_key, webhook_url, enabled) 
VALUES ('test', 'https://example.com/webhook', true);

SELECT * FROM webhooks;
```

---

### **Teste 3: Inserir uma mensagem**

```sql
INSERT INTO messages (instance_key, message_id, remote_jid, from_me, message_content, timestamp) 
VALUES ('test', 'msg123', '5511999999999@s.whatsapp.net', false, 'Olá!', 1234567890);

SELECT * FROM messages;
```

---

## 📊 Consultas Úteis

### **Ver todas as tabelas:**

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

---

### **Contar registros em cada tabela:**

```sql
SELECT 
    'chats' as tabela, COUNT(*) as total FROM chats
UNION ALL
SELECT 
    'webhooks', COUNT(*) FROM webhooks
UNION ALL
SELECT 
    'messages', COUNT(*) FROM messages;
```

---

### **Ver estrutura de uma tabela:**

```sql
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'chats'
ORDER BY ordinal_position;
```

---

### **Ver índices de uma tabela:**

```sql
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'chats';
```

---

## 🎨 Views Criadas

O script também cria 3 views úteis. Para vê-las:

1. Na árvore de navegação, vá em **Visualizações** (Views)
2. Clique com botão direito → **Refresh**
3. Você verá:
   - **instance_stats**
   - **recent_messages**
   - **webhook_status**

### **Usar as views:**

```sql
-- Estatísticas por instância
SELECT * FROM instance_stats;

-- Últimas mensagens
SELECT * FROM recent_messages;

-- Status dos webhooks
SELECT * FROM webhook_status;
```

---

## 🔧 Troubleshooting

### ❌ Erro: "permission denied for schema public"

**Solução:**

```sql
GRANT ALL ON SCHEMA public TO seu_usuario;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO seu_usuario;
```

---

### ❌ Erro: "relation already exists"

**Causa:** As tabelas já existem (mas podem estar vazias)

**Solução 1:** Verificar se já existem:

```sql
SELECT * FROM chats;
SELECT * FROM webhooks;
SELECT * FROM messages;
```

**Solução 2:** Dropar e recriar:

O script já faz isso automaticamente no início:
```sql
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS webhooks CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
```

---

### ❌ Erro ao executar o script

**Solução:** Execute em partes:

1. Primeiro, execute apenas a parte de DROP:
```sql
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS webhooks CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
```

2. Depois, execute a criação da tabela `chats`

3. Depois, `webhooks`

4. Depois, `messages`

---

## 📸 Screenshot Guia

Baseado na sua screenshot, aqui está o caminho:

```
1. Clique com botão direito em "postgres_whatsapp" (banco de dados)
   └─ Selecione "Query Tool"

2. Cole o script SQL completo

3. Clique no botão ▶️ (Execute)

4. Aguarde a execução

5. Volte para "Tabelas" → Clique com botão direito → "Refresh"

6. Expanda "Tabelas" e veja:
   ├─ chats
   ├─ messages
   └─ webhooks
```

---

## ✅ Verificação Final

Após executar o script, execute esta query:

```sql
SELECT 
    t.table_name,
    (SELECT COUNT(*) 
     FROM information_schema.columns 
     WHERE table_name = t.table_name) as colunas,
    (SELECT COUNT(*) 
     FROM pg_indexes 
     WHERE tablename = t.table_name) as indices
FROM information_schema.tables t
WHERE t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
    AND t.table_name IN ('chats', 'webhooks', 'messages')
ORDER BY t.table_name;
```

**Resultado esperado:**

| table_name | colunas | indices |
|------------|---------|---------|
| chats      | 10      | 5       |
| messages   | 17      | 7       |
| webhooks   | 14      | 3       |

---

## 🎯 Próximo Passo

Após criar as tabelas, você precisa **habilitar o PostgreSQL no Render**:

1. Acesse o Render Dashboard
2. Vá em **Environment Variables**
3. Adicione:
   - **Key:** `POSTGRES_ENABLED`
   - **Value:** `true`
4. Salve e aguarde o redeploy

Isso fará com que a API use o PostgreSQL e salve as mensagens automaticamente.

---

## 💡 Dica

Se você quiser que as tabelas sejam criadas automaticamente no próximo deploy, siga o guia **QUICK_DEPLOY_GUIDE.md** para configurar as variáveis de ambiente corretas no Render.

---

**Precisa de ajuda?** Me avise se encontrar algum erro!
