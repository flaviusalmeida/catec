package br.com.catec.domain.cliente;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "cliente")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_pessoa", nullable = false, length = 2)
    private TipoPessoa tipoPessoa;

    @Column(name = "razao_social_ou_nome", nullable = false)
    private String razaoSocialOuNome;

    @Column(name = "nome_fantasia")
    private String nomeFantasia;

    @Column(name = "documento", length = 14)
    private String documento;

    @Column(name = "email")
    private String email;

    @Column(name = "telefone", length = 11)
    private String telefone;

    @Column(name = "endereco_logradouro")
    private String enderecoLogradouro;

    @Column(name = "endereco_cidade")
    private String enderecoCidade;

    @Column(name = "endereco_uf")
    private String enderecoUf;

    @Column(name = "endereco_cep")
    private String enderecoCep;

    @Column(name = "observacoes")
    private String observacoes;

    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    public Long getId() {
        return id;
    }

    public TipoPessoa getTipoPessoa() {
        return tipoPessoa;
    }

    public String getRazaoSocialOuNome() {
        return razaoSocialOuNome;
    }

    public String getNomeFantasia() {
        return nomeFantasia;
    }

    public String getDocumento() {
        return documento;
    }

    public String getEmail() {
        return email;
    }

    public String getTelefone() {
        return telefone;
    }

    public String getEnderecoLogradouro() {
        return enderecoLogradouro;
    }

    public String getEnderecoCidade() {
        return enderecoCidade;
    }

    public String getEnderecoUf() {
        return enderecoUf;
    }

    public String getEnderecoCep() {
        return enderecoCep;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public Instant getAtualizadoEm() {
        return atualizadoEm;
    }

    public void setTipoPessoa(TipoPessoa tipoPessoa) {
        this.tipoPessoa = tipoPessoa;
    }

    public void setRazaoSocialOuNome(String razaoSocialOuNome) {
        this.razaoSocialOuNome = razaoSocialOuNome;
    }

    public void setNomeFantasia(String nomeFantasia) {
        this.nomeFantasia = nomeFantasia;
    }

    public void setDocumento(String documento) {
        this.documento = documento;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public void setEnderecoLogradouro(String enderecoLogradouro) {
        this.enderecoLogradouro = enderecoLogradouro;
    }

    public void setEnderecoCidade(String enderecoCidade) {
        this.enderecoCidade = enderecoCidade;
    }

    public void setEnderecoUf(String enderecoUf) {
        this.enderecoUf = enderecoUf;
    }

    public void setEnderecoCep(String enderecoCep) {
        this.enderecoCep = enderecoCep;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public void setCriadoEm(Instant criadoEm) {
        this.criadoEm = criadoEm;
    }

    public void setAtualizadoEm(Instant atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }
}
