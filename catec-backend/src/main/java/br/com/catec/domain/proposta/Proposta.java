package br.com.catec.domain.proposta;

import br.com.catec.domain.projeto.Projeto;
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
@Table(name = "proposta")
public class Proposta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "projeto_id", nullable = false)
    private Projeto projeto;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private PropostaStatus status;

    @Column(nullable = false)
    private int versao = 1;

    @Column(name = "requer_avaliacao_socio", nullable = false)
    private boolean requerAvaliacaoSocio;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "elaborado_por_id", nullable = false)
    private Usuario elaboradoPor;

    @Column(name = "enviada_cliente_em")
    private Instant enviadaClienteEm;

    @Column(name = "avaliada_socio_em")
    private Instant avaliadaSocioEm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "avaliada_por_socio_id")
    private Usuario avaliadaPorSocio;

    @Column(name = "aceita_cliente_em")
    private Instant aceitaClienteEm;

    @Column(name = "negada_cliente_em")
    private Instant negadaClienteEm;

    @Column(name = "motivo_negativa_cliente", columnDefinition = "TEXT")
    private String motivoNegativaCliente;

    @Column(name = "consideracoes_pendentes", nullable = false)
    private boolean consideracoesPendentes;

    @Column(name = "cobranca_proposta_inicio_em")
    private Instant cobrancaPropostaInicioEm;

    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm = Instant.now();

    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm = Instant.now();

    public Long getId() {
        return id;
    }

    public Projeto getProjeto() {
        return projeto;
    }

    public void setProjeto(Projeto projeto) {
        this.projeto = projeto;
    }

    public PropostaStatus getStatus() {
        return status;
    }

    public void setStatus(PropostaStatus status) {
        this.status = status;
    }

    public int getVersao() {
        return versao;
    }

    public void setVersao(int versao) {
        this.versao = versao;
    }

    public boolean isRequerAvaliacaoSocio() {
        return requerAvaliacaoSocio;
    }

    public void setRequerAvaliacaoSocio(boolean requerAvaliacaoSocio) {
        this.requerAvaliacaoSocio = requerAvaliacaoSocio;
    }

    public Usuario getElaboradoPor() {
        return elaboradoPor;
    }

    public void setElaboradoPor(Usuario elaboradoPor) {
        this.elaboradoPor = elaboradoPor;
    }

    public Instant getEnviadaClienteEm() {
        return enviadaClienteEm;
    }

    public void setEnviadaClienteEm(Instant enviadaClienteEm) {
        this.enviadaClienteEm = enviadaClienteEm;
    }

    public Instant getAvaliadaSocioEm() {
        return avaliadaSocioEm;
    }

    public void setAvaliadaSocioEm(Instant avaliadaSocioEm) {
        this.avaliadaSocioEm = avaliadaSocioEm;
    }

    public Usuario getAvaliadaPorSocio() {
        return avaliadaPorSocio;
    }

    public void setAvaliadaPorSocio(Usuario avaliadaPorSocio) {
        this.avaliadaPorSocio = avaliadaPorSocio;
    }

    public Instant getAceitaClienteEm() {
        return aceitaClienteEm;
    }

    public void setAceitaClienteEm(Instant aceitaClienteEm) {
        this.aceitaClienteEm = aceitaClienteEm;
    }

    public Instant getNegadaClienteEm() {
        return negadaClienteEm;
    }

    public void setNegadaClienteEm(Instant negadaClienteEm) {
        this.negadaClienteEm = negadaClienteEm;
    }

    public String getMotivoNegativaCliente() {
        return motivoNegativaCliente;
    }

    public void setMotivoNegativaCliente(String motivoNegativaCliente) {
        this.motivoNegativaCliente = motivoNegativaCliente;
    }

    public boolean isConsideracoesPendentes() {
        return consideracoesPendentes;
    }

    public void setConsideracoesPendentes(boolean consideracoesPendentes) {
        this.consideracoesPendentes = consideracoesPendentes;
    }

    public Instant getCobrancaPropostaInicioEm() {
        return cobrancaPropostaInicioEm;
    }

    public void setCobrancaPropostaInicioEm(Instant cobrancaPropostaInicioEm) {
        this.cobrancaPropostaInicioEm = cobrancaPropostaInicioEm;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(Instant criadoEm) {
        this.criadoEm = criadoEm;
    }

    public Instant getAtualizadoEm() {
        return atualizadoEm;
    }

    public void setAtualizadoEm(Instant atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }
}
