# 📡 Guia Completo: Configurar Webhook de Recebimento de Mensagens

## 🎯 O Que é o Webhook?

O webhook é uma URL que sua aplicação fornece para receber notificações em tempo real quando eventos acontecem no WhatsApp, como:

- ✅ **Mensagens recebidas** (texto, imagem, áudio, vídeo, documento)
- ✅ **Mensagens atualizadas** (lidas, entregues, deletadas)
- ✅ **Reações a mensagens**
- ✅ **Status de conexão** (conectado, desconectado)
- ✅ **Atualizações de grupos** (participantes adicionados/removidos)

---

## 📋 Pré-requisitos

Antes de configurar o webhook, você precisa:

1. ✅ **API WhatsApp rodando** (https://api-whatsapp-ew.onrender.com)
2. ✅ **Instância criada e conectada** ao WhatsApp
3. ✅ **URL pública** para receber webhooks (seu servidor/aplicação)

---

## 🚀 Passo 1: Criar Endpoint para Receber Webhooks

Primeiro, você precisa criar um endpoint na **sua aplicação** que vai receber os webhooks.

### **Exemplo em Node.js/Express:**

```javascript
const express = require('express')
const app = express()

app.use(express.json())

// Endpoint para receber webhooks do WhatsApp
app.post('/webhook/whatsapp', (req, res) => {
    const { instance_key, event, data, timestamp } = req.body
    
    console.log('📩 Webhook recebido!')
    console.log('Instância:', instance_key)
    console.log('Evento:', event)
    console.log('Dados:', JSON.stringify(data, null, 2))
    console.log('Timestamp:', new Date(timestamp))
    
    // Processa a mensagem
    if (event === 'messages_upsert') {
        const message = data.message
        const from = data.from
        const body = data.body
        
        console.log(`Mensagem de ${from}: ${body}`)
        
        // Aqui você pode:
        // - Salvar no banco de dados
        // - Enviar resposta automática
        // - Processar comandos
        // - Integrar com outros sistemas
    }
    
    // IMPORTANTE: Responder rapidamente para não bloquear
    res.status(200).json({ received: true })
})

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000')
})
```

### **Exemplo em Python/Flask:**

```python
from flask import Flask, request, jsonify
from datetime import datetime

app = Flask(__name__)

@app.route('/webhook/whatsapp', methods=['POST'])
def webhook_whatsapp():
    data = request.json
    
    instance_key = data.get('instance_key')
    event = data.get('event')
    event_data = data.get('data')
    timestamp = data.get('timestamp')
    
    print(f'📩 Webhook recebido!')
    print(f'Instância: {instance_key}')
    print(f'Evento: {event}')
    print(f'Dados: {event_data}')
    print(f'Timestamp: {datetime.fromtimestamp(timestamp/1000)}')
    
    # Processa mensagem
    if event == 'messages_upsert':
        message = event_data.get('message')
        from_number = event_data.get('from')
        body = event_data.get('body')
        
        print(f'Mensagem de {from_number}: {body}')
        
        # Aqui você pode processar a mensagem
    
    # Responder rapidamente
    return jsonify({'received': True}), 200

if __name__ == '__main__':
    app.run(port=3000)
```

---

## 🌐 Passo 2: Expor Seu Endpoint Publicamente

Seu endpoint precisa ser acessível pela internet. Opções:

### **Opção 1: Deploy em Servidor (Produção)**
- Render.com
- Heroku
- AWS/Google Cloud/Azure
- DigitalOcean

### **Opção 2: Túnel para Desenvolvimento (Testes)**

**Usando ngrok:**
```bash
# Instalar ngrok
npm install -g ngrok

# Criar túnel
ngrok http 3000
```

Você receberá uma URL pública:
```
https://abc123.ngrok.io
```

**Usando localtunnel:**
```bash
# Instalar localtunnel
npm install -g localtunnel

# Criar túnel
lt --port 3000
```

---

## ⚙️ Passo 3: Configurar Webhook na API WhatsApp

Agora configure o webhook na sua instância do WhatsApp.

### **Endpoint:**
```
POST https://api-whatsapp-ew.onrender.com/webhook/set?key=INSTANCE_KEY
```

### **Headers:**
```
Authorization: Bearer 8c60114e5b3d9b9e64d9b2a4cf0e1a1d
Content-Type: application/json
```

### **Body (JSON):**

**Configuração Básica (Recomendado):**
```json
{
  "webhook_url": "https://sua-url.com/webhook/whatsapp",
  "enabled": true
}
```

**Configuração Avançada (Eventos Específicos):**
```json
{
  "webhook_url": "https://sua-url.com/webhook/whatsapp",
  "enabled": true,
  "events": {
    "messages": true,
    "messages_upsert": true,
    "messages_update": false,
    "messages_delete": false,
    "message_reaction": true,
    "presence_update": false,
    "chats_upsert": false,
    "chats_update": false,
    "chats_delete": false,
    "contacts_upsert": false,
    "contacts_update": false,
    "groups_upsert": false,
    "groups_update": false,
    "group_participants_update": false,
    "connection_update": true
  }
}
```

### **Exemplo usando cURL:**
```bash
curl -X POST "https://api-whatsapp-ew.onrender.com/webhook/set?key=minha-instancia" \
  -H "Authorization: Bearer 8c60114e5b3d9b9e64d9b2a4cf0e1a1d" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook_url": "https://sua-url.com/webhook/whatsapp",
    "enabled": true
  }'
```

### **Exemplo usando Postman:**

1. **Method:** POST
2. **URL:** `https://api-whatsapp-ew.onrender.com/webhook/set?key=minha-instancia`
3. **Headers:**
   - `Authorization`: `Bearer 8c60114e5b3d9b9e64d9b2a4cf0e1a1d`
   - `Content-Type`: `application/json`
4. **Body (raw JSON):**
   ```json
   {
     "webhook_url": "https://sua-url.com/webhook/whatsapp",
     "enabled": true
   }
   ```

### **Resposta de Sucesso:**
```json
{
  "error": false,
  "message": "Webhook configured successfully",
  "webhook": {
    "instance_key": "minha-instancia",
    "webhook_url": "https://sua-url.com/webhook/whatsapp",
    "enabled": true,
    "events": {
      "messages": true,
      "messages_upsert": true,
      "messages_update": true,
      ...
    },
    "retry_count": 3,
    "retry_delay": 1000,
    "total_sent": 0,
    "total_failed": 0
  }
}
```

---

## ✅ Passo 4: Testar Webhook

### **Teste Automático:**

```bash
curl -X GET "https://api-whatsapp-ew.onrender.com/webhook/test?key=minha-instancia" \
  -H "Authorization: Bearer 8c60114e5b3d9b9e64d9b2a4cf0e1a1d"
```

Você deve receber no seu endpoint:
```json
{
  "instance_key": "minha-instancia",
  "event": "test",
  "data": {
    "test": true,
    "message": "This is a test webhook from WhatsApp API",
    "timestamp": 1768868327077
  },
  "timestamp": 1768868327077
}
```

### **Teste Real:**

Envie uma mensagem para o número do WhatsApp conectado e verifique se o webhook é chamado.

---

## 📊 Estrutura dos Dados Recebidos

### **Evento: messages_upsert (Nova Mensagem)**

```json
{
  "instance_key": "minha-instancia",
  "event": "messages_upsert",
  "data": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": false,
      "id": "3EB0XXXXX"
    },
    "messageType": "conversation",
    "message": {
      "conversation": "Olá! Como posso ajudar?"
    },
    "pushName": "João Silva",
    "broadcast": false,
    "messageTimestamp": 1768868327,
    "from": "5511999999999@s.whatsapp.net",
    "to": "5511888888888@s.whatsapp.net",
    "body": "Olá! Como posso ajudar?",
    "fromMe": false,
    "hasMedia": false,
    "ack": 1
  },
  "timestamp": 1768868327077
}
```

### **Campos Importantes:**

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| `instance_key` | Chave da instância | `"minha-instancia"` |
| `event` | Tipo de evento | `"messages_upsert"` |
| `data.from` | Número do remetente | `"5511999999999@s.whatsapp.net"` |
| `data.to` | Número do destinatário | `"5511888888888@s.whatsapp.net"` |
| `data.body` | Texto da mensagem | `"Olá! Como posso ajudar?"` |
| `data.pushName` | Nome do contato | `"João Silva"` |
| `data.messageType` | Tipo da mensagem | `"conversation"`, `"imageMessage"`, etc |
| `data.hasMedia` | Tem mídia? | `true` ou `false` |
| `data.fromMe` | Enviada por mim? | `true` ou `false` |
| `timestamp` | Timestamp do evento | `1768868327077` |

### **Tipos de Mensagem:**

- `conversation` - Texto simples
- `extendedTextMessage` - Texto com formatação/links
- `imageMessage` - Imagem
- `videoMessage` - Vídeo
- `audioMessage` - Áudio
- `documentMessage` - Documento
- `stickerMessage` - Sticker
- `locationMessage` - Localização
- `contactMessage` - Contato
- `buttonsResponseMessage` - Resposta de botões
- `listResponseMessage` - Resposta de lista

---

## 🔧 Gerenciar Webhook

### **Verificar Configuração Atual:**

```bash
curl -X GET "https://api-whatsapp-ew.onrender.com/webhook/get?key=minha-instancia" \
  -H "Authorization: Bearer 8c60114e5b3d9b9e64d9b2a4cf0e1a1d"
```

### **Remover Webhook:**

```bash
curl -X DELETE "https://api-whatsapp-ew.onrender.com/webhook/remove?key=minha-instancia" \
  -H "Authorization: Bearer 8c60114e5b3d9b9e64d9b2a4cf0e1a1d"
```

### **Atualizar Webhook:**

Basta chamar `/webhook/set` novamente com os novos dados.

---

## 💡 Boas Práticas

### **1. Responda Rapidamente**

O webhook deve responder em menos de 5 segundos:

```javascript
app.post('/webhook/whatsapp', async (req, res) => {
    // Responder IMEDIATAMENTE
    res.status(200).json({ received: true })
    
    // Processar DEPOIS (assíncrono)
    processWebhook(req.body).catch(console.error)
})

async function processWebhook(data) {
    // Processamento pesado aqui
    await saveToDatabase(data)
    await sendNotification(data)
}
```

### **2. Validar Dados**

```javascript
app.post('/webhook/whatsapp', (req, res) => {
    const { instance_key, event, data } = req.body
    
    // Validar
    if (!instance_key || !event || !data) {
        return res.status(400).json({ error: 'Invalid payload' })
    }
    
    // Processar...
    res.status(200).json({ received: true })
})
```

### **3. Tratar Erros**

```javascript
app.post('/webhook/whatsapp', async (req, res) => {
    try {
        // Responder primeiro
        res.status(200).json({ received: true })
        
        // Processar depois
        await processWebhook(req.body)
    } catch (error) {
        console.error('Erro ao processar webhook:', error)
        // Não retornar erro 500, pois já respondeu 200
    }
})
```

### **4. Implementar Retry Automático**

A API já faz 3 tentativas automáticas com delay de 1 segundo entre elas.

### **5. Logs e Monitoramento**

```javascript
app.post('/webhook/whatsapp', (req, res) => {
    const { instance_key, event, data } = req.body
    
    console.log(`[${new Date().toISOString()}] Webhook recebido`)
    console.log(`Instância: ${instance_key}`)
    console.log(`Evento: ${event}`)
    
    // Salvar em arquivo de log ou serviço de monitoramento
    
    res.status(200).json({ received: true })
})
```

---

## 🆘 Troubleshooting

### **Problema: Webhook não é chamado**

**Soluções:**
1. Verifique se o webhook está configurado: `GET /webhook/get?key=INSTANCE_KEY`
2. Verifique se `enabled: true`
3. Teste o webhook: `GET /webhook/test?key=INSTANCE_KEY`
4. Verifique se sua URL é acessível publicamente
5. Verifique logs da API no Render

### **Problema: Webhook retorna erro 500**

**Soluções:**
1. Verifique logs do seu servidor
2. Teste sua URL manualmente com cURL
3. Verifique se está respondendo rapidamente (< 5s)
4. Verifique se está retornando status 200

### **Problema: Recebe webhook duplicado**

**Soluções:**
1. Implemente idempotência usando `message.key.id`
2. Salve IDs de mensagens já processadas
3. Ignore mensagens duplicadas

### **Problema: Não recebe mídia**

**Soluções:**
1. Verifique `data.hasMedia` no webhook
2. Use endpoint `/message/download` para baixar mídia
3. Verifique se o tipo de mensagem está correto

---

## 📚 Exemplos Práticos

### **Exemplo 1: Bot de Resposta Automática**

```javascript
app.post('/webhook/whatsapp', async (req, res) => {
    res.status(200).json({ received: true })
    
    const { instance_key, event, data } = req.body
    
    if (event === 'messages_upsert' && !data.fromMe) {
        const from = data.from
        const body = data.body?.toLowerCase()
        
        let response = ''
        
        if (body.includes('oi') || body.includes('olá')) {
            response = 'Olá! Como posso ajudar você hoje?'
        } else if (body.includes('preço') || body.includes('valor')) {
            response = 'Nossos preços começam em R$ 99,90. Quer saber mais?'
        } else if (body.includes('horário')) {
            response = 'Atendemos de segunda a sexta, das 9h às 18h.'
        } else {
            response = 'Desculpe, não entendi. Digite "ajuda" para ver opções.'
        }
        
        // Enviar resposta
        await axios.post(
            `https://api-whatsapp-ew.onrender.com/message/text?key=${instance_key}`,
            {
                id: from,
                message: response
            },
            {
                headers: {
                    'Authorization': 'Bearer 8c60114e5b3d9b9e64d9b2a4cf0e1a1d'
                }
            }
        )
    }
})
```

### **Exemplo 2: Salvar Mensagens no Banco**

```javascript
const { MongoClient } = require('mongodb')

const mongoClient = new MongoClient('mongodb+srv://...')
const db = mongoClient.db('whatsapp')
const messages = db.collection('messages')

app.post('/webhook/whatsapp', async (req, res) => {
    res.status(200).json({ received: true })
    
    const { instance_key, event, data } = req.body
    
    if (event === 'messages_upsert') {
        await messages.insertOne({
            instance_key,
            message_id: data.key.id,
            from: data.from,
            to: data.to,
            body: data.body,
            message_type: data.messageType,
            timestamp: new Date(data.messageTimestamp * 1000),
            from_me: data.fromMe,
            received_at: new Date()
        })
    }
})
```

### **Exemplo 3: Integração com CRM**

```javascript
app.post('/webhook/whatsapp', async (req, res) => {
    res.status(200).json({ received: true })
    
    const { instance_key, event, data } = req.body
    
    if (event === 'messages_upsert' && !data.fromMe) {
        // Extrair número do cliente
        const phoneNumber = data.from.replace('@s.whatsapp.net', '')
        
        // Buscar cliente no CRM
        const customer = await crmApi.findCustomerByPhone(phoneNumber)
        
        if (customer) {
            // Cliente existente - adicionar mensagem ao histórico
            await crmApi.addMessageToCustomer(customer.id, {
                message: data.body,
                timestamp: new Date(data.messageTimestamp * 1000)
            })
        } else {
            // Novo cliente - criar registro
            await crmApi.createCustomer({
                name: data.pushName,
                phone: phoneNumber,
                first_message: data.body,
                source: 'whatsapp'
            })
        }
    }
})
```

---

## 🎯 Próximos Passos

Após configurar o webhook:

1. ✅ Teste enviando mensagens
2. ✅ Implemente lógica de resposta automática
3. ✅ Integre com seu sistema/banco de dados
4. ✅ Configure monitoramento e logs
5. ✅ Implemente tratamento de erros robusto

---

## 📞 Suporte

Se tiver dúvidas ou problemas:

1. Verifique os logs da API no Render
2. Teste o webhook manualmente com `/webhook/test`
3. Verifique se sua URL está acessível
4. Consulte a documentação da API

---

**Repositório:** https://github.com/melquifranco/api-whatsapp-ew

**API URL:** https://api-whatsapp-ew.onrender.com

**Boa sorte com seu webhook!** 🚀
