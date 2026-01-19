# Guia Completo de Webhooks

## 📋 O que é Webhook?

Um webhook permite que sua aplicação **receba notificações em tempo real** quando eventos acontecem no WhatsApp, como:

- 📨 Mensagens recebidas
- ✅ Status de mensagens (entregue, lida)
- 👥 Mudanças em grupos
- 🔌 Status de conexão
- E muito mais!

---

## 🚀 Como Funcionar

### 1. **Configurar Webhook**

```http
POST https://api-whatsapp-ew.onrender.com/webhook/set?key=sua-instancia
Authorization: Bearer SEU_TOKEN

Body:
{
  "webhook_url": "https://seu-servidor.com/webhook",
  "enabled": true,
  "events": {
    "messages": true,
    "messages_upsert": true,
    "messages_update": true,
    "messages_delete": false,
    "message_reaction": true,
    "presence_update": false,
    "connection_update": true
  }
}
```

**Resposta:**
```json
{
  "error": false,
  "message": "Webhook configured successfully",
  "webhook": {
    "id": "uuid",
    "instance_key": "sua-instancia",
    "webhook_url": "https://seu-servidor.com/webhook",
    "enabled": true,
    "events": {...},
    "retry_count": 3,
    "retry_delay": 1000
  }
}
```

### 2. **Verificar Configuração**

```http
GET https://api-whatsapp-ew.onrender.com/webhook/get?key=sua-instancia
Authorization: Bearer SEU_TOKEN
```

### 3. **Testar Webhook**

```http
GET https://api-whatsapp-ew.onrender.com/webhook/test?key=sua-instancia
Authorization: Bearer SEU_TOKEN
```

Envia uma mensagem de teste para seu webhook.

### 4. **Remover Webhook**

```http
DELETE https://api-whatsapp-ew.onrender.com/webhook/remove?key=sua-instancia
Authorization: Bearer SEU_TOKEN
```

---

## 📨 Formato do Payload

Quando um evento acontece, a API envia um POST para sua URL:

### Mensagem Recebida

```json
{
  "instance_key": "sua-instancia",
  "event": "messages_upsert",
  "timestamp": 1705622400000,
  "data": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": false,
      "id": "3EB0XXXXX"
    },
    "message": {
      "conversation": "Olá! Como vai?"
    },
    "messageTimestamp": 1705622400,
    "pushName": "João Silva"
  }
}
```

### Conexão Atualizada

```json
{
  "instance_key": "sua-instancia",
  "event": "connection_update",
  "timestamp": 1705622400000,
  "data": {
    "connection": "open",
    "isNewLogin": false
  }
}
```

---

## 🔧 Implementando seu Servidor Webhook

### Node.js + Express

```javascript
const express = require('express')
const app = express()

app.use(express.json())

app.post('/webhook', (req, res) => {
    const { instance_key, event, data, timestamp } = req.body
    
    console.log(`Evento recebido: ${event}`)
    console.log(`Instância: ${instance_key}`)
    console.log(`Dados:`, data)
    
    // Processar evento
    if (event === 'messages_upsert') {
        const message = data.message
        const from = data.key.remoteJid
        
        if (message.conversation) {
            console.log(`Mensagem de ${from}: ${message.conversation}`)
            
            // Responder automaticamente
            // ... seu código aqui
        }
    }
    
    // IMPORTANTE: Responder rapidamente
    res.status(200).json({ received: true })
})

app.listen(3000, () => {
    console.log('Webhook server rodando na porta 3000')
})
```

### Python + Flask

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def webhook():
    data = request.json
    
    instance_key = data.get('instance_key')
    event = data.get('event')
    event_data = data.get('data')
    
    print(f'Evento recebido: {event}')
    print(f'Instância: {instance_key}')
    
    if event == 'messages_upsert':
        message = event_data.get('message', {})
        from_jid = event_data.get('key', {}).get('remoteJid')
        
        if 'conversation' in message:
            text = message['conversation']
            print(f'Mensagem de {from_jid}: {text}')
            
            # Processar mensagem
            # ... seu código aqui
    
    # IMPORTANTE: Responder rapidamente
    return jsonify({'received': True}), 200

if __name__ == '__main__':
    app.run(port=3000)
```

---

## 🌐 Expondo seu Webhook Local

Para testes locais, use **ngrok**:

```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta 3000
ngrok http 3000
```

Copie a URL gerada (ex: `https://abc123.ngrok.io`) e use como `webhook_url`.

---

## 📊 Eventos Disponíveis

| Evento | Descrição | Recomendado |
|--------|-----------|-------------|
| `messages` | Todas as mensagens | ✅ Sim |
| `messages_upsert` | Novas mensagens | ✅ Sim |
| `messages_update` | Mensagens atualizadas | ⚠️ Opcional |
| `messages_delete` | Mensagens deletadas | ⚠️ Opcional |
| `message_reaction` | Reações em mensagens | ⚠️ Opcional |
| `presence_update` | Status online/offline | ❌ Não (muito frequente) |
| `chats_upsert` | Novos chats | ⚠️ Opcional |
| `chats_update` | Chats atualizados | ⚠️ Opcional |
| `chats_delete` | Chats deletados | ❌ Não |
| `contacts_upsert` | Novos contatos | ❌ Não |
| `contacts_update` | Contatos atualizados | ❌ Não |
| `groups_upsert` | Novos grupos | ⚠️ Opcional |
| `groups_update` | Grupos atualizados | ⚠️ Opcional |
| `group_participants_update` | Participantes de grupo | ⚠️ Opcional |
| `connection_update` | Status de conexão | ✅ Sim |

---

## ⚙️ Configurações Avançadas

### Retry (Tentativas)

Por padrão, a API tenta enviar 3 vezes com delay de 1 segundo entre tentativas.

Para customizar:

```json
{
  "webhook_url": "https://seu-servidor.com/webhook",
  "retry_count": 5,
  "retry_delay": 2000
}
```

### Timeout

O webhook tem timeout de **10 segundos**. Seu servidor deve responder rapidamente!

**Dica:** Processe eventos de forma assíncrona:

```javascript
app.post('/webhook', async (req, res) => {
    // Responder imediatamente
    res.status(200).json({ received: true })
    
    // Processar depois (assíncrono)
    processEventAsync(req.body)
})
```

---

## 📝 Histórico de Mensagens

Todas as mensagens recebidas são salvas no PostgreSQL!

### Listar Mensagens

```http
GET https://api-whatsapp-ew.onrender.com/webhook/messages?key=sua-instancia&limit=50
Authorization: Bearer SEU_TOKEN
```

**Resposta:**
```json
{
  "error": false,
  "message": "Messages retrieved successfully",
  "count": 50,
  "messages": [
    {
      "id": "uuid",
      "instance_key": "sua-instancia",
      "message_id": "3EB0XXXXX",
      "remote_jid": "5511999999999@s.whatsapp.net",
      "from_me": false,
      "message_type": "conversation",
      "message_text": "Olá!",
      "timestamp": 1705622400000,
      "webhook_sent": true,
      "createdAt": "2025-01-19T00:00:00.000Z"
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Webhook não está recebendo eventos

1. **Verifique se está habilitado:**
   ```http
   GET /webhook/get?key=sua-instancia
   ```

2. **Teste o webhook:**
   ```http
   GET /webhook/test?key=sua-instancia
   ```

3. **Verifique os logs do Render:**
   - Procure por erros de conexão
   - Veja se o webhook está sendo chamado

4. **Verifique seu servidor:**
   - Está rodando?
   - Está acessível publicamente?
   - Responde em menos de 10 segundos?

### Webhook recebe duplicatas

Isso pode acontecer se:
- Seu servidor demora para responder (>10s)
- Seu servidor retorna erro (status != 200)

**Solução:** Implemente **idempotência** usando `message_id`:

```javascript
const processedMessages = new Set()

app.post('/webhook', (req, res) => {
    const messageId = req.body.data?.key?.id
    
    if (processedMessages.has(messageId)) {
        // Já processado, ignorar
        return res.status(200).json({ received: true })
    }
    
    processedMessages.add(messageId)
    
    // Processar mensagem
    // ...
    
    res.status(200).json({ received: true })
})
```

### Webhook falha constantemente

Verifique na tabela `webhooks`:
- `last_error`: Último erro ocorrido
- `last_failure_at`: Quando falhou
- `total_failed`: Total de falhas

```sql
SELECT * FROM webhooks WHERE instance_key = 'sua-instancia';
```

---

## 🎯 Boas Práticas

1. ✅ **Responda rapidamente** (< 1 segundo)
2. ✅ **Processe de forma assíncrona**
3. ✅ **Implemente idempotência**
4. ✅ **Valide o payload**
5. ✅ **Logue todos os eventos**
6. ✅ **Monitore falhas**
7. ❌ **Não faça operações pesadas no webhook**
8. ❌ **Não chame APIs externas síncronas**

---

## 📚 Recursos

- [Documentação Baileys](https://whiskeysockets.github.io/Baileys/)
- [Postman Collection](./WhatsApp_API_Final.postman_collection.json)
- [Environment](./WhatsApp_API_Environment.postman_environment.json)

---

## 🆘 Suporte

Se tiver problemas:
1. Verifique os logs do Render
2. Teste o webhook manualmente
3. Verifique o histórico de mensagens
4. Consulte a documentação

**Webhook configurado com sucesso!** 🎉
