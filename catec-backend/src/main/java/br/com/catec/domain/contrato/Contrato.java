package br.com.catec.domain.contrato;

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
@Table(name = "contrato")
public class Contrato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "projeto_id", nullable = false)
    private Projeto projeto;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ContratoStatus status;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "elaborado_por_id", nullable = false)
    private Usuario elaboradoPor;

    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm = Instant.now();

    @Column(name = "enviado_cliente_em")
    private Instant enviadoClienteEm;

    @Column(name = "aceito_cliente_em")
    private Instant aceitoClienteEm;

    @Column(name = "recusado_cliente_em")
    private Instant recusadoClienteEm;

    @Column(name = "motivo_recusa_cliente", columnDefinition = "TEXT")
    private String motivoRecusaCliente;

    @Column(name = "consideracoes_pendentes", nullable = false)
    private boolean consideracoesPendentes;

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

    public ContratoStatus getStatus() {
        return status;
    }

    public void setStatus(ContratoStatus status) {
        this.status = status;
    }

    public Usuario getElaboradoPor() {
        return elaboradoPor;
    }

    public void setElaboradoPor(Usuario elaboradoPor) {
        this.elaboradoPor = elaboradoPor;
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

    public Instant getEnviadoClienteEm() {
        return enviadoClienteEm;
    }

    public void setEnviadoClienteEm(Instant enviadoClienteEm) {
        this.enviadoClienteEm = enviadoClienteEm;
    }

    public Instant getAceitoClienteEm() {
        return aceitoClienteEm;
    }

    public void setAceitoClienteEm(Instant aceitoClienteEm) {
        this.aceitoClienteEm = aceitoClienteEm;
    }

    public Instant getRecusadoClienteEm() {
        return recusadoClienteEm;
    }

    public void setRecusadoClienteEm(Instant recusadoClienteEm) {
        this.recusadoClienteEm = recusadoClienteEm;
    }

    public String getMotivoRecusaCliente() {
        return motivoRecusaCliente;
    }

    public void setMotivoRecusaCliente(String motivoRecusaCliente) {
        this.motivoRecusaCliente = motivoRecusaCliente;
    }

    public boolean isConsideracoesPendentes() {
        return consideracoesPendentes;
    }

    public void setConsideracoesPendentes(boolean consideracoesPendentes) {
        this.consideracoesPendentes = consideracoesPendentes;
    }
}
