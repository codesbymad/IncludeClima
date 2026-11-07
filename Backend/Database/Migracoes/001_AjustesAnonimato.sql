BEGIN;

ALTER TABLE respostas ADD COLUMN IF NOT EXISTS area VARCHAR(100);

ALTER TABLE participacoes DROP COLUMN IF EXISTS data_envio;

UPDATE usuarios SET is_lider = FALSE WHERE is_lider IS NULL;
ALTER TABLE usuarios ALTER COLUMN is_lider SET NOT NULL;

ALTER TABLE pesquisa_perguntas ALTER COLUMN id_pesq SET NOT NULL;
ALTER TABLE pesquisa_perguntas ALTER COLUMN id_perg SET NOT NULL;
ALTER TABLE respostas ALTER COLUMN pesquisa_pergunta_id SET NOT NULL;

ALTER TABLE respostas 
    ADD CONSTRAINT respostas_nota_check CHECK (valor_numerico BETWEEN 1 AND 5);
ALTER TABLE respostas
    ADD CONSTRAINT respostas_valor_check CHECK (valor_numerico IS NOT NULL OR valor_texto IS NOT NULL);
ALTER TABLE pesquisas
    ADD CONSTRAINT pesquisas_periodo_check CHECK (data_fim >= data_inicio);

COMMIT;