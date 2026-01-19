# 🚀 Guia Rápido: Deploy e Criação das Tabelas

## ✅ O Que Mudou

Corrigi o problema das tabelas não serem criadas automaticamente. Agora você tem **3 opções** para criar as tabelas no PostgreSQL.

---

## 🎯 Opção 1: Automático via Redeploy (Recomendado)

### Passo 1: Redeploy no Render

1. Acesse: https://dashboard.render.com
2. Selecione o serviço `api-whatsapp-ew`
3. Clique em **"Manual Deploy"** → **"Deploy latest commit"**
4. Aguarde o deploy completar (2-3 minutos)

### Passo 2: Verificar Logs

1. Clique na aba **"Logs"**
2. Procure por estas mensagens:

```
✅ Connected to PostgreSQL successfully
✅ Database tables synchronized successfully
✅ Found 3 tables in database: [ 'chats', 'webhooks', 'messages' ]
```

Se aparecer essas mensagens, **está tudo certo!** ✅

### Passo 3: Verificar no Banco (Opcional)

1. Vá em **Databases** → Selecione seu PostgreSQL
2. Clique em **"Connect"** → Copie a **External Database URL**
3. Use um cliente SQL ou execute:

```bash
psql "sua-database-url" -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
```

Deve mostrar:
```
 table_name 
------------
 chats
 messages
 webhooks
```

---

## 🎯 Opção 2: Executar Script SQL Manualmente

Se o automático não funcionar, você pode executar o script SQL diretamente.

### Passo 1: Baixar o Script

O script está em: `database/schema.sql`

Ou baixe do GitHub:
```bash
curl -O https://raw.githubusercontent.com/melquifranco/api-whatsapp-ew/main/database/schema.sql
```

### Passo 2: Conectar no PostgreSQL

**Usando psql:**

```bash
psql "postgresql://user:pass@host:5432/dbname" -f schema.sql
```

**Usando pgAdmin ou DBeaver:**

1. Abra o arquivo `schema.sql`
2. Copie todo o conteúdo
3. Cole no Query Editor
4. Execute (F5)

### Passo 3: Verificar

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

---

## 🎯 Opção 3: Forçar Recriação (⚠️ Apaga Dados!)

Use esta opção **apenas se**:
- As tabelas existem mas com estrutura errada
- Você não se importa em perder os dados atuais

### Passo 1: Adicionar Variável no Render

1. Vá em **Environment** → **Environment Variables**
2. Clique em **"Add Environment Variable"**
3. Adicione:
   - **Key:** `DATABASE_RESET`
   - **Value:** `true`
4. Clique em **"Save Changes"**

### Passo 2: Aguardar Redeploy Automático

O Render vai fazer redeploy automaticamente.

Nos logs você verá:
```
⚠️  DATABASE_RESET=true - Recreating all tables!
✅ Database tables synchronized successfully
```

### Passo 3: IMPORTANTE - Remover a Variável

**Não esqueça deste passo!**

1. Volte em **Environment Variables**
2. Encontre `DATABASE_RESET`
3. Clique no ícone de **lixeira** para deletar
4. Clique em **"Save Changes"**

Isso vai fazer outro redeploy, mas agora sem recriar as tabelas.

---

## 📊 O Que Foi Criado

### Tabelas:

1. **`chats`** - Conversas e grupos
   - 10 colunas
   - 4 índices
   - Constraint único (instance_key + remote_jid)

2. **`webhooks`** - Configurações de webhook
   - 14 colunas
   - 2 índices
   - Constraint único (instance_key)

3. **`messages`** - Histórico de mensagens
   - 17 colunas
   - 6 índices
   - Constraint único (instance_key + message_id)

### Views (Consultas Prontas):

1. **`instance_stats`** - Estatísticas por instância
2. **`recent_messages`** - Últimas 100 mensagens
3. **`webhook_status`** - Status dos webhooks

### Triggers:

- Auto-atualização de `updated_at` nas tabelas `chats` e `webhooks`

---

## 🧪 Como Testar

### 1. Verificar se as tabelas existem:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### 2. Testar inserção em chats:

```sql
INSERT INTO chats (instance_key, remote_jid, name, is_group) 
VALUES ('test', '5511999999999@s.whatsapp.net', 'Teste', false);

SELECT * FROM chats;
```

### 3. Testar webhook:

```sql
INSERT INTO webhooks (instance_key, webhook_url, enabled) 
VALUES ('test', 'https://example.com/webhook', true);

SELECT * FROM webhooks;
```

### 4. Testar mensagem:

```sql
INSERT INTO messages (instance_key, message_id, remote_jid, from_me, message_content, timestamp) 
VALUES ('test', 'msg123', '5511999999999@s.whatsapp.net', false, 'Olá!', 1234567890);

SELECT * FROM messages;
```

### 5. Testar views:

```sql
-- Estatísticas
SELECT * FROM instance_stats;

-- Mensagens recentes
SELECT * FROM recent_messages;

-- Status de webhooks
SELECT * FROM webhook_status;
```

---

## 🆘 Troubleshooting

### ❌ Problema: Logs mostram erro de conexão

**Erro:**
```
Failed to initialize PostgreSQL: Connection refused
```

**Solução:**
1. Verifique se `DATABASE_URL` está configurada
2. Vá em **Environment** → Verifique a variável
3. Formato correto: `postgresql://user:pass@host:5432/dbname`

---

### ❌ Problema: Tabelas não aparecem

**Solução 1:** Execute o script SQL manualmente (Opção 2)

**Solução 2:** Use `DATABASE_RESET=true` (Opção 3)

---

### ❌ Problema: Erro "relation does not exist"

**Causa:** Tabelas não foram criadas

**Solução:** Execute o script SQL manualmente

---

### ❌ Problema: Estrutura de tabela diferente

**Solução:** Use `DATABASE_RESET=true` para recriar

---

## ✅ Checklist Final

Após o deploy, verifique:

- [ ] Logs mostram "Database tables synchronized successfully"
- [ ] Logs mostram "Found 3 tables in database"
- [ ] Tabelas `chats`, `webhooks`, `messages` existem
- [ ] API responde normalmente
- [ ] Endpoints de webhook funcionam

---

## 📚 Documentação Completa

Para mais detalhes, consulte:

- **`database/README.md`** - Guia completo do banco de dados
- **`database/schema.sql`** - Script SQL completo
- **`WEBHOOK_GUIDE.md`** - Guia de webhook
- **`RENDER_PERSISTENT_DISK.md`** - Guia de persistência

---

## 🎯 Próximos Passos

Após criar as tabelas:

1. ✅ Testar endpoints de webhook
2. ✅ Configurar webhook para sua instância
3. ✅ Enviar mensagem de teste
4. ✅ Verificar se foi salva no banco
5. ✅ (Opcional) Configurar Persistent Disk

---

## 💡 Dica

**Recomendo usar a Opção 1 (Automático)** primeiro. É mais simples e seguro.

Se não funcionar, use a Opção 2 (Script SQL Manual).

Use a Opção 3 apenas se realmente precisar recriar tudo.

---

**Precisa de ajuda?** Verifique os logs do Render ou me avise!
