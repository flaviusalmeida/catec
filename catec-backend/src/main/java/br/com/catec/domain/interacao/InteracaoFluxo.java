package br.com.catec.domain.interacao;

import br.com.catec.domain.documento.Documento;
import br.com.catec.domain.usuario.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "interacao_fluxo")
public class InteracaoFluxo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_entidade", nullable = false, length = 40)
    private TipoEntidadeInteracao tipoEntidade;

    @Column(name = "entidade_id", nullable = false)
    private Long entidadeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_interacao", nullable = false, length = 60)
    private TipoInteracaoFluxo tipoInteracao;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String texto;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registrado_por_usuario_id", nullable = false)
    private Usuario registradoPor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "documento_id")
    private Documento documento;

    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm = Instant.now();

    public Long getId() {
        return id;
    }

    public TipoEntidadeInteracao getTipoEntidade() {
        return tipoEntidade;
    }

    public void setTipoEntidade(TipoEntidadeInteracao tipoEntidade) {
        this.tipoEntidade = tipoEntidade;
    }

    public Long getEntidadeId() {
        return entidadeId;
    }

    public void setEntidadeId(Long entidadeId) {
        this.entidadeId = entidadeId;
    }

    public TipoInteracaoFluxo getTipoInteracao() {
        return tipoInteracao;
    }

    public void setTipoInteracao(TipoInteracaoFluxo tipoInteracao) {
        this.tipoInteracao = tipoInteracao;
    }

    public String getTexto() {
        return texto;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }

    public Usuario getRegistradoPor() {
        return registradoPor;
    }

    public void setRegistradoPor(Usuario registradoPor) {
        this.registradoPor = registradoPor;
    }

    public Documento getDocumento() {
        return documento;
    }

    public void setDocumento(Documento documento) {
        this.documento = documento;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(Instant criadoEm) {
        this.criadoEm = criadoEm;
    }
}
