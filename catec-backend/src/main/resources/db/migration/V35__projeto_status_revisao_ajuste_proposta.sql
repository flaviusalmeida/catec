-- Status de projeto alinhados ao fluxo de revisão/reprovação da proposta comercial.

ALTER TABLE projeto DROP CONSTRAINT IF EXISTS ck_projeto_status;

ALTER TABLE projeto ADD CONSTRAINT ck_projeto_status CHECK (status IN (
    'PENDENTE_CLIENTE',
    'AGUARDANDO_PROPOSTA_COMERCIAL',
    'ELABORANDO_PROPOSTA',
    'AGUARDANDO_REVISAO_PROPOSTA',
    'AGUARDANDO_AJUSTE',
    'AGUARDANDO_ACEITE_PROPOSTA',
    'AGUARDANDO_CONTRATO',
    'AGUARDANDO_EXECUCAO',
    'EM_EXECUCAO',
    'CANCELADO',
    'FINALIZADO'
));

ALTER TABLE proposta ADD COLUMN IF NOT EXISTS parecer_socio TEXT;
