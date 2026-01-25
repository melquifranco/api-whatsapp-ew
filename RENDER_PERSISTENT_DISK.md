# Configuração de Persistência de Sessões no Render.com

## 📋 Problema

Por padrão, o Render.com usa um **sistema de arquivos efêmero**. Isso significa que:

- ✅ Os arquivos funcionam durante a execução do serviço
- ❌ **Todos os arquivos são perdidos** quando o serviço reinicia
- ❌ Sessões do WhatsApp são perdidas a cada redeploy
- ❌ Você precisa escanear o QR Code novamente

## 💡 Solução: Render Persistent Disks

O Render oferece **Persistent Disks** que mantêm os dados mesmo após reinicializações.

---

## 🚀 Como Configurar

### Passo 1: Criar Persistent Disk

1. Acesse o [Dashboard do Render](https://dashboard.render.com)
2. Vá até o seu Web Service `api-whatsapp-ew`
3. Clique na aba **"Disks"** no menu lateral
4. Clique em **"Add Disk"**
5. Configure:
   - **Name:** `whatsapp-sessions`
   - **Mount Path:** `/data`
   - **Size:** 1 GB (suficiente para sessões)
6. Clique em **"Save"**

### Passo 2: Atualizar Variável de Ambiente

1. Vá na aba **"Environment"**
2. Adicione ou edite a variável:
   ```
   AUTH_DIR=/data/whatsapp_auth
   ```
3. Clique em **"Save Changes"**

### Passo 3: Redeploy

O Render vai fazer redeploy automático. Aguarde completar.

---

## 📊 Como Funciona

### Antes (Sistema Efêmero):
```
/tmp/whatsapp_auth/
├── instance-123/
│   ├── creds.json
│   └── keys/
```
❌ Perdido a cada reinicialização

### Depois (Persistent Disk):
```
/data/whatsapp_auth/
├── instance-123/
│   ├── creds.json
│   └── keys/
```
✅ Mantido permanentemente

---

## ✅ Benefícios

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Persistência** | ❌ Perdida | ✅ Permanente |
| **QR Code** | Sempre necessário | Uma vez apenas |
| **Uptime** | Interrompido | Contínuo |
| **Produção** | ❌ Não recomendado | ✅ Pronto para produção |

---

## 💰 Custo

- **1 GB:** $0.25/mês
- **10 GB:** $2.50/mês

Muito barato para a conveniência!

---

## 🔧 Verificação

Após configurar, verifique nos logs:

```bash
# Deve mostrar:
Created new auth directory for instance XXX at /data/whatsapp_auth/XXX
```

---

## ⚠️ Notas Importantes

1. **Backup:** O Render faz backup automático dos Persistent Disks
2. **Performance:** Não há impacto significativo de performance
3. **Migração:** Se já tem sessões ativas, você precisará reconectar uma vez
4. **Múltiplas instâncias:** Todas as instâncias compartilham o mesmo disco

---

## 🐛 Troubleshooting

### Problema: Sessões ainda são perdidas

**Solução:**
1. Verifique se o mount path está correto: `/data`
2. Verifique se a variável `AUTH_DIR=/data/whatsapp_auth` está configurada
3. Veja os logs para confirmar que está usando o caminho correto

### Problema: Erro de permissão

**Solução:**
O Render configura as permissões automaticamente. Se houver erro:
1. Verifique se o mount path não tem `/` no final
2. Tente recriar o disk

---

## 📚 Documentação Oficial

- [Render Persistent Disks](https://render.com/docs/disks)
- [Pricing](https://render.com/pricing)

---

## 🎯 Alternativa: Sem Persistent Disk

Se você **não quiser** usar Persistent Disk:

- ✅ A API funciona normalmente
- ❌ Você precisa escanear QR Code após cada redeploy
- ❌ Não recomendado para produção

O código já está preparado para funcionar em ambos os cenários!
