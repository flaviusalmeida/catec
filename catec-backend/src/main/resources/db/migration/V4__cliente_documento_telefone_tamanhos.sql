-- Documento: só dígitos (máx. 14 = CNPJ). Telefone: só dígitos (máx. 11 = DDD + celular).

UPDATE cliente
SET telefone = NULLIF(btrim(LEFT(regexp_replace(telefone, '[^0-9]', '', 'g'), 11)), '')
WHERE telefone IS NOT NULL
  AND btrim(telefone) <> '';

UPDATE cliente
SET documento = NULLIF(btrim(LEFT(regexp_replace(documento, '[^0-9]', '', 'g'), 14)), '')
WHERE documento IS NOT NULL
  AND btrim(documento) <> '';

ALTER TABLE cliente
    ALTER COLUMN documento TYPE VARCHAR(14);

ALTER TABLE cliente
    ALTER COLUMN telefone TYPE VARCHAR(11);
