# 📊 Guia de Banco de Dados PostgreSQL

## 🎯 Opções para Criar as Tabelas

Você tem **3 opções** para criar as tabelas no PostgreSQL:

---

## ✅ Opção 1: Executar Script SQL Manualmente (Recomendado)

### Passo 1: Conectar no PostgreSQL do Render

1. Acesse o [Render Dashboard](https://dashboard.render.com)
2. Vá em **Databases** → Selecione seu banco PostgreSQL
3. Na aba **Info**, copie a **External Database URL**
4. Use um cliente PostgreSQL (pgAdmin, DBeaver, ou psql)

### Passo 2: Executar o Script

**Usando psql (linha de comando):**

```bash
psql "postgresql://usuario:senha@host:5432/database" -f database/schema.sql
```

**Usando pgAdmin ou DBeaver:**

1. Abra o arquivo `database/schema.sql`
2. Copie todo o conteúdo
3. Cole no Query Editor
4. Execute (F5 ou botão Run)

### Passo 3: Verificar

Execute no PostgreSQL:

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

## 🔄 Opção 2: Usar Sincronização Automática do Sequelize

### Método A: Sincronização Normal (Seguro)

A API já está configurada para criar as tabelas automaticamente no startup.

**Como funciona:**
- Ao iniciar, o Sequelize verifica se as tabelas existem
- Se não existirem, cria automaticamente
- Se existirem, altera apenas se necessário

**Basta fazer redeploy:**

1. Commit e push das alterações
2. Redeploy no Render
3. Verifique os logs: `"Database tables synchronized successfully"`

### Método B: Forçar Recriação (⚠️ Apaga Dados!)

Se as tabelas estiverem com estrutura errada, você pode forçar a recriação:

**No Render:**

1. Vá em **Environment** → Add Environment Variable
2. Adicione: `DATABASE_RESET=true`
3. Salve e aguarde redeploy
4. **IMPORTANTE:** Após criar, remova a variável `DATABASE_RESET` e faça redeploy novamente!

**⚠️ ATENÇÃO:** Isso vai **apagar todos os dados** das tabelas!

---

## 🛠️ Opção 3: Usar Endpoint de Inicialização (Futuro)

Podemos criar um endpoint `/admin/init-database` que você chama uma vez para criar as tabelas.

**Vantagens:**
- Não precisa acessar o banco diretamente
- Pode ser executado via Postman
- Protegido por autenticação

**Quer que eu implemente isso?**

---

## 📋 Estrutura das Tabelas

### Tabela: `chats`

Armazena conversas e grupos.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | SERIAL | ID único |
| instance_key | VARCHAR | Chave da instância |
| remote_jid | VARCHAR | ID do chat (número@s.whatsapp.net) |
| name | VARCHAR | Nome do contato/grupo |
| is_group | BOOLEAN | Se é grupo |
| participant_count | INTEGER | Número de participantes |
| last_message_time | TIMESTAMP | Última mensagem |
| metadata | JSONB | Metadados adicionais |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Última atualização |

**Índices:**
- Único: (instance_key, remote_jid)
- instance_key
- remote_jid
- is_group

---

### Tabela: `webhooks`

Configurações de webhook por instância.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | SERIAL | ID único |
| instance_key | VARCHAR | Chave da instância (único) |
| webhook_url | TEXT | URL do webhook |
| enabled | BOOLEAN | Se está ativo |
| events | JSONB | Eventos habilitados |
| headers | JSONB | Headers customizados |
| retry_count | INTEGER | Tentativas de retry |
| timeout | INTEGER | Timeout em ms |
| last_triggered_at | TIMESTAMP | Último disparo |
| success_count | INTEGER | Sucessos |
| failure_count | INTEGER | Falhas |
| last_error | TEXT | Último erro |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Última atualização |

**Índices:**
- Único: instance_key
- enabled

---

### Tabela: `messages`

Histórico completo de mensagens.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | SERIAL | ID único |
| instance_key | VARCHAR | Chave da instância |
| message_id | VARCHAR | ID da mensagem |
| remote_jid | VARCHAR | Chat de origem |
| from_me | BOOLEAN | Se foi enviada por você |
| participant | VARCHAR | Participante (em grupos) |
| message_type | VARCHAR | Tipo (text, image, etc) |
| message_content | TEXT | Conteúdo da mensagem |
| message_data | JSONB | Dados completos |
| timestamp | BIGINT | Timestamp Unix |
| status | VARCHAR | Status da mensagem |
| webhook_sent | BOOLEAN | Se foi enviada ao webhook |
| webhook_status | VARCHAR | Status do envio |
| webhook_attempts | INTEGER | Tentativas |
| webhook_last_attempt | TIMESTAMP | Última tentativa |
| webhook_error | TEXT | Erro do webhook |
| created_at | TIMESTAMP | Data de criação |

**Índices:**
- Único: (instance_key, message_id)
- instance_key
- remote_jid
- from_me
- timestamp
- webhook_sent
- created_at

---

## 🔍 Views Criadas

O script também cria 3 views úteis:

### 1. `instance_stats`

Estatísticas por instância:

```sql
SELECT * FROM instance_stats;
```

Retorna:
- total_chats
- total_messages
- sent_messages
- received_messages
- last_message_timestamp
- last_activity

### 2. `recent_messages`

Últimas 100 mensagens:

```sql
SELECT * FROM recent_messages;
```

### 3. `webhook_status`

Status dos webhooks:

```sql
SELECT * FROM webhook_status;
```

Retorna:
- instance_key
- webhook_url
- enabled
- success_count
- failure_count
- success_rate (%)
- last_triggered_at
- last_error

---

## 🧪 Comandos Úteis

### Verificar tabelas criadas:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Verificar estrutura de uma tabela:

```sql
\d+ chats
\d+ webhooks
\d+ messages
```

### Contar registros:

```sql
SELECT 
    'chats' as table_name, COUNT(*) as count FROM chats
UNION ALL
SELECT 
    'webhooks', COUNT(*) FROM webhooks
UNION ALL
SELECT 
    'messages', COUNT(*) FROM messages;
```

### Ver últimas mensagens:

```sql
SELECT 
    instance_key,
    remote_jid,
    message_content,
    from_me,
    created_at
FROM messages
ORDER BY created_at DESC
LIMIT 10;
```

### Ver configurações de webhook:

```sql
SELECT 
    instance_key,
    webhook_url,
    enabled,
    success_count,
    failure_count
FROM webhooks;
```

---

## 🆘 Troubleshooting

### Problema: Tabelas não foram criadas após redeploy

**Solução:**

1. Verifique os logs do Render:
   - Procure por: `"Database tables synchronized successfully"`
   - Se não aparecer, há erro de conexão

2. Verifique variáveis de ambiente:
   - `DATABASE_URL` deve estar configurada
   - Formato: `postgresql://user:pass@host:5432/dbname`

3. Execute o script SQL manualmente (Opção 1)

### Problema: Erro "relation does not exist"

**Causa:** Tabelas não foram criadas

**Solução:** Execute o script SQL manualmente

### Problema: Estrutura de tabela errada

**Solução:**

1. Adicione `DATABASE_RESET=true` no Render
2. Redeploy
3. Remova `DATABASE_RESET=true`
4. Redeploy novamente

### Problema: Dados foram perdidos

**Causa:** Usou `DATABASE_RESET=true`

**Prevenção:** Sempre faça backup antes:

```sql
-- Backup
COPY chats TO '/tmp/chats_backup.csv' CSV HEADER;
COPY webhooks TO '/tmp/webhooks_backup.csv' CSV HEADER;
COPY messages TO '/tmp/messages_backup.csv' CSV HEADER;

-- Restore
COPY chats FROM '/tmp/chats_backup.csv' CSV HEADER;
COPY webhooks FROM '/tmp/webhooks_backup.csv' CSV HEADER;
COPY messages FROM '/tmp/messages_backup.csv' CSV HEADER;
```

---

## 📚 Próximos Passos

Após criar as tabelas:

1. ✅ Redeploy da API no Render
2. ✅ Testar endpoints de webhook
3. ✅ Configurar webhook para sua instância
4. ✅ Enviar mensagem de teste
5. ✅ Verificar se foi salva no banco

---

## 💡 Dicas

1. **Use a Opção 1** se você tem acesso ao banco
2. **Use a Opção 2** se prefere automático
3. **Sempre verifique os logs** após deploy
4. **Faça backup** antes de usar `DATABASE_RESET=true`
5. **Use as views** para consultas rápidas

---

**Precisa de ajuda?** Verifique os logs do Render ou execute o script SQL manualmente.
