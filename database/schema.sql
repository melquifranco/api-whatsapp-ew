-- ========================================
-- WhatsApp API - PostgreSQL Schema
-- ========================================
-- Este script cria todas as tabelas necessárias
-- para o funcionamento da API WhatsApp
-- ========================================

-- Limpar tabelas existentes (cuidado em produção!)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS webhooks CASCADE;
DROP TABLE IF EXISTS chats CASCADE;

-- ========================================
-- Tabela: chats
-- ========================================
-- Armazena informações sobre conversas e grupos
-- ========================================

CREATE TABLE chats (
    id SERIAL PRIMARY KEY,
    instance_key VARCHAR(255) NOT NULL,
    remote_jid VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    is_group BOOLEAN DEFAULT false,
    participant_count INTEGER DEFAULT 0,
    last_message_time TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices para performance
    CONSTRAINT unique_chat UNIQUE (instance_key, remote_jid)
);

-- Índices adicionais
CREATE INDEX idx_chats_instance ON chats(instance_key);
CREATE INDEX idx_chats_remote_jid ON chats(remote_jid);
CREATE INDEX idx_chats_is_group ON chats(is_group);
CREATE INDEX idx_chats_last_message ON chats(last_message_time DESC);

-- ========================================
-- Tabela: webhooks
-- ========================================
-- Configurações de webhook por instância
-- ========================================

CREATE TABLE webhooks (
    id SERIAL PRIMARY KEY,
    instance_key VARCHAR(255) NOT NULL UNIQUE,
    webhook_url TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    events JSONB DEFAULT '{}',
    headers JSONB DEFAULT '{}',
    retry_count INTEGER DEFAULT 3,
    timeout INTEGER DEFAULT 10000,
    last_triggered_at TIMESTAMP,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_webhooks_instance ON webhooks(instance_key);
CREATE INDEX idx_webhooks_enabled ON webhooks(enabled);

-- ========================================
-- Tabela: messages
-- ========================================
-- Histórico completo de mensagens
-- ========================================

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    instance_key VARCHAR(255) NOT NULL,
    message_id VARCHAR(255) NOT NULL,
    remote_jid VARCHAR(255) NOT NULL,
    from_me BOOLEAN DEFAULT false,
    participant VARCHAR(255),
    message_type VARCHAR(50),
    message_content TEXT,
    message_data JSONB,
    timestamp BIGINT,
    status VARCHAR(50),
    webhook_sent BOOLEAN DEFAULT false,
    webhook_status VARCHAR(50),
    webhook_attempts INTEGER DEFAULT 0,
    webhook_last_attempt TIMESTAMP,
    webhook_error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices para performance
    CONSTRAINT unique_message UNIQUE (instance_key, message_id)
);

-- Índices adicionais
CREATE INDEX idx_messages_instance ON messages(instance_key);
CREATE INDEX idx_messages_remote_jid ON messages(remote_jid);
CREATE INDEX idx_messages_from_me ON messages(from_me);
CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX idx_messages_webhook_sent ON messages(webhook_sent);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- ========================================
-- Triggers para atualizar updated_at
-- ========================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para chats
CREATE TRIGGER update_chats_updated_at 
    BEFORE UPDATE ON chats 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para webhooks
CREATE TRIGGER update_webhooks_updated_at 
    BEFORE UPDATE ON webhooks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Views úteis
-- ========================================

-- View: Estatísticas por instância
CREATE OR REPLACE VIEW instance_stats AS
SELECT 
    instance_key,
    COUNT(DISTINCT remote_jid) as total_chats,
    COUNT(*) as total_messages,
    COUNT(*) FILTER (WHERE from_me = true) as sent_messages,
    COUNT(*) FILTER (WHERE from_me = false) as received_messages,
    MAX(timestamp) as last_message_timestamp,
    MAX(created_at) as last_activity
FROM messages
GROUP BY instance_key;

-- View: Mensagens recentes (últimas 100)
CREATE OR REPLACE VIEW recent_messages AS
SELECT 
    m.id,
    m.instance_key,
    m.remote_jid,
    m.from_me,
    m.message_type,
    m.message_content,
    m.timestamp,
    m.created_at,
    c.name as chat_name,
    c.is_group
FROM messages m
LEFT JOIN chats c ON m.instance_key = c.instance_key AND m.remote_jid = c.remote_jid
ORDER BY m.created_at DESC
LIMIT 100;

-- View: Status de webhooks
CREATE OR REPLACE VIEW webhook_status AS
SELECT 
    instance_key,
    webhook_url,
    enabled,
    success_count,
    failure_count,
    CASE 
        WHEN failure_count = 0 THEN 100.0
        ELSE ROUND((success_count::numeric / (success_count + failure_count) * 100), 2)
    END as success_rate,
    last_triggered_at,
    last_error
FROM webhooks
ORDER BY last_triggered_at DESC;

-- ========================================
-- Dados iniciais (opcional)
-- ========================================

-- Você pode adicionar configurações padrão aqui se necessário

-- ========================================
-- Verificação final
-- ========================================

-- Listar todas as tabelas criadas
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name IN ('chats', 'webhooks', 'messages')
ORDER BY table_name;

-- Listar todas as views criadas
SELECT table_name as view_name
FROM information_schema.views
WHERE table_schema = 'public'
    AND table_name IN ('instance_stats', 'recent_messages', 'webhook_status')
ORDER BY table_name;

-- ========================================
-- Comandos úteis para verificação
-- ========================================

-- Verificar estrutura de uma tabela:
-- \d+ chats
-- \d+ webhooks
-- \d+ messages

-- Verificar índices:
-- \di

-- Verificar views:
-- \dv

-- Testar inserção:
-- INSERT INTO chats (instance_key, remote_jid, name, is_group) 
-- VALUES ('test', '5511999999999@s.whatsapp.net', 'Teste', false);

-- Verificar dados:
-- SELECT * FROM chats;
-- SELECT * FROM webhooks;
-- SELECT * FROM messages;
-- SELECT * FROM instance_stats;

-- ========================================
-- FIM DO SCRIPT
-- ========================================
