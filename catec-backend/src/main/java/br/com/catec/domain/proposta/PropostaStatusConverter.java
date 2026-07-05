package br.com.catec.domain.proposta;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class PropostaStatusConverter implements AttributeConverter<PropostaStatus, String> {

    @Override
    public String convertToDatabaseColumn(PropostaStatus attribute) {
        return attribute == null ? null : attribute.name();
    }

    @Override
    public PropostaStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        if ("APROVADA".equals(dbData)) {
            return PropostaStatus.AGUARDANDO_ENVIO;
        }
        return PropostaStatus.valueOf(dbData);
    }
}
