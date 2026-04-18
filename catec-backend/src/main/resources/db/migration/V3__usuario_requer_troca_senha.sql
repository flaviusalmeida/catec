-- Primeiro acesso / reset: obrigar troca de senha antes de acesso pleno.
ALTER TABLE usuario ADD COLUMN requer_troca_senha BOOLEAN NOT NULL DEFAULT FALSE;
