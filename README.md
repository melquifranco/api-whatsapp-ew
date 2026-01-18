# WhatsApp API - PostgreSQL Edition

API WhatsApp construída com Baileys-MD e PostgreSQL para deploy no Render.com.

## 🚀 Características

- ✅ Envio e recebimento de mensagens WhatsApp
- ✅ Suporte a múltiplas instâncias
- ✅ Webhooks para eventos
- ✅ Gerenciamento de grupos
- ✅ Envio de mídia (imagens, vídeos, áudios, documentos)
- ✅ **PostgreSQL** como banco de dados (compatível com Render.com)
- ✅ Sequelize ORM

## 📋 Pré-requisitos

- Node.js v16 ou superior
- PostgreSQL 12 ou superior
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/melquifranco/api-whatsapp-ew.git
cd api-whatsapp-ew
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com suas configurações:
```env
# Segurança
TOKEN=seu_token_secreto_aqui
PROTECT_ROUTES=true

# Aplicação
PORT=3333
RESTORE_SESSIONS_ON_START_UP=false
APP_URL=https://seu-app.onrender.com

# Banco de Dados PostgreSQL
POSTGRES_ENABLED=true
POSTGRES_HOST=seu-host-postgres
POSTGRES_PORT=5432
POSTGRES_DB=whatsapp_api
POSTGRES_USER=seu_usuario
POSTGRES_PASSWORD=sua_senha

# Webhook (opcional)
WEBHOOK_ENABLED=false
WEBHOOK_URL=https://seu-webhook.com
```

5. Inicie o servidor:
```bash
npm start
```

Para desenvolvimento:
```bash
npm run dev
```

## 🌐 Deploy no Render.com

### 1. Criar Banco PostgreSQL

1. Acesse [Render.com](https://render.com)
2. Clique em **New +** → **PostgreSQL**
3. Configure o banco e anote as credenciais

### 2. Criar Web Service

1. Clique em **New +** → **Web Service**
2. Conecte seu repositório GitHub: `melquifranco/api-whatsapp-ew`
3. Configure:
   - **Name**: `api-whatsapp-ew`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis no Render:

```
TOKEN=seu_token_secreto
PROTECT_ROUTES=true
POSTGRES_ENABLED=true
POSTGRES_HOST=<host_do_render>
POSTGRES_PORT=5432
POSTGRES_DB=<nome_do_banco>
POSTGRES_USER=<usuario>
POSTGRES_PASSWORD=<senha>
APP_URL=https://seu-app.onrender.com
```

### 4. Deploy

Clique em **Create Web Service** e aguarde o deploy!

## 📚 Documentação da API

### Autenticação

Todas as rotas (quando `PROTECT_ROUTES=true`) requerem o header:
```
Authorization: Bearer SEU_TOKEN
```

### Endpoints Principais

#### Criar Instância
```http
POST /instance/init
Content-Type: application/json

{
  "key": "minha-instancia"
}
```

#### Obter QR Code
```http
GET /instance/qr?key=minha-instancia
```

#### Enviar Mensagem
```http
POST /message/text
Content-Type: application/json

{
  "key": "minha-instancia",
  "id": "5511999999999@s.whatsapp.net",
  "message": "Olá, mundo!"
}
```

#### Enviar Imagem
```http
POST /message/image
Content-Type: application/json

{
  "key": "minha-instancia",
  "id": "5511999999999@s.whatsapp.net",
  "image": "https://exemplo.com/imagem.jpg",
  "caption": "Legenda da imagem"
}
```

Para documentação completa, importe a collection do Postman incluída no repositório: `whatsapp-api-nodejs.postman_collection.json`

## 🔄 Migração de MongoDB para PostgreSQL

Este projeto foi migrado de MongoDB para PostgreSQL. Para mais detalhes sobre as mudanças, veja [POSTGRES_MIGRATION.md](./POSTGRES_MIGRATION.md).

### Principais Alterações:

- **Mongoose** → **Sequelize**
- **MongoDB** → **PostgreSQL**
- Novo modelo de dados com suporte a JSON
- Configuração simplificada via variáveis de ambiente

## 🛠️ Tecnologias

- [Baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web API
- [Express](https://expressjs.com/) - Framework web
- [Sequelize](https://sequelize.org/) - ORM para PostgreSQL
- [PostgreSQL](https://www.postgresql.org/) - Banco de dados relacional
- [Pino](https://getpino.io/) - Logger

## 📝 Licença

MIT

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## ⚠️ Aviso Legal

Este projeto é apenas para fins educacionais. O uso do WhatsApp de forma automatizada pode violar os Termos de Serviço do WhatsApp. Use por sua conta e risco.

## 📧 Suporte

Para questões e suporte, abra uma issue no GitHub.

## 🙏 Créditos

Este projeto é baseado no [whatsapp-api-nodejs](https://github.com/salman0ansari/whatsapp-api-nodejs) de [@salman0ansari](https://github.com/salman0ansari).

---

**Desenvolvido com ❤️ para a comunidade**
