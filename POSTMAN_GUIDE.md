# 📦 Guia de Uso - Postman Collection

## 📥 Arquivos incluídos:

1. **WhatsApp_API_Final.postman_collection.json** - Collection completa com 30+ endpoints
2. **WhatsApp_API_Environment.postman_environment.json** - Variáveis de ambiente
3. **POSTMAN_GUIDE.md** - Este guia

---

## 🚀 Como importar no Postman:

### Passo 1: Importar Collection
1. Abra o Postman
2. Clique em **"Import"** (canto superior esquerdo)
3. Arraste o arquivo `WhatsApp_API_Final.postman_collection.json`
4. Clique em **"Import"**

### Passo 2: Importar Environment
1. Clique em **"Import"** novamente
2. Arraste o arquivo `WhatsApp_API_Environment.postman_environment.json`
3. Clique em **"Import"**

### Passo 3: Configurar Environment
1. Clique no dropdown de environments (canto superior direito)
2. Selecione **"WhatsApp API - Render.com"**
3. Clique no ícone de **"olho"** ao lado
4. Clique em **"Edit"**
5. Configure as variáveis:

```
base_url = https://api-whatsapp-ew.onrender.com
api_token = SEU_TOKEN_DO_RENDER
instance_key = meu-whatsapp
phone_number = 5511999999999@s.whatsapp.net
group_id = 120363XXXXXXXXXX@g.us
```

6. Clique em **"Save"**

---

## ⚠️ PROBLEMA IMPORTANTE - Instance Key

### O que acontece:

Quando você cria uma instância **SEM** passar o parâmetro `key`, o sistema gera um UUID aleatório:

```
GET /instance/init?webhook=false
→ Retorna: "key": "2ad50856-4aef-4ea3-8c43-9e2f47..."
```

Após escanear o QR Code e reconectar, uma **NOVA** instance_key pode ser gerada:

```
GET /instance/list
→ Retorna: "instance_key": "f0108222-0778-417f-b6f6-467252fdb129"
```

### ✅ SOLUÇÃO:

**SEMPRE passe o parâmetro `key` ao criar instância:**

```
GET /instance/init?key=meu-whatsapp&webhook=false
```

Assim a chave permanece **fixa**: `meu-whatsapp`

---

## 📋 Fluxo de uso recomendado:

### 1. Criar Instância
```
GET /instance/init?key=meu-whatsapp&webhook=false
```

**⚠️ IMPORTANTE:** Use o endpoint **"1. Criar Instância (com chave customizada)"**

### 2. Ver QR Code
```
GET /instance/qr?key=meu-whatsapp
```

**Abra no navegador!** A página atualiza automaticamente até o QR aparecer.

### 3. Escanear com WhatsApp
- Abra WhatsApp no celular
- Vá em **"Aparelhos conectados"**
- Toque em **"Conectar um aparelho"**
- Escaneie o QR Code

### 4. Aguardar Conexão
Aguarde ~10 segundos após escanear.

### 5. Verificar Instância
```
GET /instance/list
```

Deve retornar:
```json
{
  "error": false,
  "data": [{
    "instance_key": "meu-whatsapp",
    "phone_connected": true,
    "user": {
      "id": "5521969580515:84@s.whatsapp.net",
      "name": "Seu Nome"
    }
  }]
}
```

### 6. Enviar Mensagem de Teste
```
POST /message/text?key=meu-whatsapp
Body:
{
  "id": "5511999999999@s.whatsapp.net",
  "message": "Teste da API! 🚀"
}
```

---

## 📱 Formato de Números:

### Contatos:
```
CÓDIGO_PAÍS + DDD + NÚMERO@s.whatsapp.net
```

**Exemplos:**
- Brasil: `5511999999999@s.whatsapp.net`
- EUA: `14155551234@s.whatsapp.net`
- Portugal: `351912345678@s.whatsapp.net`

### Grupos:
```
ID_DO_GRUPO@g.us
```

**Exemplo:**
- `120363XXXXXXXXXX@g.us`

**Como obter ID do grupo:**
1. Use `GET /group/list`
2. Copie o `id` do grupo desejado

---

## 🔑 Como obter o TOKEN:

1. Acesse o Render.com
2. Vá até o Web Service **"api-whatsapp-ew"**
3. Clique em **"Environment"**
4. Procure pela variável **`TOKEN`**
5. Copie o valor
6. Cole na variável `api_token` do Postman

---

## 📚 Endpoints Organizados:

### 🔹 Instance (8 endpoints)
- Criar instância (com/sem chave)
- Ver QR Code (HTML/Base64)
- Obter info da instância
- Listar todas as instâncias
- Deletar instância
- Logout

### 💬 Messages (7 endpoints)
- Enviar texto
- Enviar imagem
- Enviar vídeo
- Enviar áudio
- Enviar documento
- Enviar localização
- Enviar contato (vCard)

### 👥 Groups (8 endpoints)
- Criar grupo
- Listar grupos
- Adicionar/remover participantes
- Promover/rebaixar admins
- Atualizar nome
- Sair do grupo

### 🔧 Misc (4 endpoints)
- Verificar se número existe
- Obter foto de perfil
- Obter status/bio
- Marcar como lida

---

## 🐛 Troubleshooting:

### Problema: "invalid key supplied"
**Causa:** A chave da instância está errada ou a instância não existe.

**Solução:**
1. Verifique se usou a chave correta
2. Liste as instâncias: `GET /instance/list`
3. Use a chave que aparece em `instance_key`

### Problema: Lista de instâncias vazia
**Causa:** 
- Nenhuma instância foi criada
- Servidor reiniciou (instâncias não persistem)
- Instância crashou ao conectar

**Solução:**
1. Crie uma nova instância
2. Escaneie o QR Code
3. Aguarde 10 segundos
4. Liste novamente

### Problema: QR Code não aparece
**Causa:** QR Code ainda está sendo gerado.

**Solução:**
1. Aguarde 5-10 segundos
2. Atualize a página do QR Code
3. Ou use `GET /instance/qrbase64` e tente novamente

### Problema: Mensagem não é enviada
**Causa:** 
- Instância não está conectada
- Número está no formato errado
- Número não existe no WhatsApp

**Solução:**
1. Verifique conexão: `GET /instance/info`
2. Verifique formato: `5511999999999@s.whatsapp.net`
3. Verifique se número existe: `GET /misc/onwhatsapp?phone=5511999999999`

---

## 🎯 Dicas:

✅ **Sempre use chave customizada** ao criar instância  
✅ **Teste com seu próprio número** primeiro  
✅ **Aguarde 10 segundos** após escanear QR Code  
✅ **Verifique os logs** do Render em caso de erro  
✅ **Use URLs públicas** para enviar mídias  

❌ **Não crie instância sem parâmetro `key`**  
❌ **Não envie spam** (pode ser banido)  
❌ **Não use números inválidos**  
❌ **Não espere persistência** (sessões são perdidas ao reiniciar)  

---

## 📖 Documentação Adicional:

- **Repositório GitHub:** https://github.com/melquifranco/api-whatsapp-ew
- **Documentação Original:** https://documenter.getpostman.com/view/12514774/UVsPQkBq
- **Baileys (biblioteca):** https://github.com/WhiskeySockets/Baileys

---

## 🆘 Suporte:

Se encontrar problemas:
1. Verifique os logs do Render
2. Consulte este guia
3. Verifique o repositório GitHub
4. Abra uma issue no GitHub

---

**Última atualização:** 19/01/2026  
**Versão:** 1.0 Final  
**Autor:** Manus AI Assistant
