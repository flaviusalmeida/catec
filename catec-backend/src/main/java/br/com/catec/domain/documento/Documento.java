package br.com.catec.domain.documento;

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
@Table(name = "documento")
public class Documento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_vinculo", nullable = false, length = 40)
    private TipoVinculoDocumento tipoVinculo;

    @Column(name = "vinculo_id", nullable = false)
    private Long vinculoId;

    @Column(name = "tipo_arquivo", length = 60)
    private String tipoArquivo;

    @Column(name = "nome_original", nullable = false, length = 500)
    private String nomeOriginal;

    @Column(name = "chave_storage", nullable = false, length = 512, unique = true)
    private String chaveStorage;

    @Column(name = "mime_type", nullable = false, length = 127)
    private String mimeType;

    @Column(name = "tamanho_bytes", nullable = false)
    private long tamanhoBytes;

    @Column(nullable = false)
    private int versao = 1;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "uploaded_por_id", nullable = false)
    private Usuario uploadedPor;

    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm = Instant.now();

    public Long getId() {
        return id;
    }

    public TipoVinculoDocumento getTipoVinculo() {
        return tipoVinculo;
    }

    public void setTipoVinculo(TipoVinculoDocumento tipoVinculo) {
        this.tipoVinculo = tipoVinculo;
    }

    public Long getVinculoId() {
        return vinculoId;
    }

    public void setVinculoId(Long vinculoId) {
        this.vinculoId = vinculoId;
    }

    public String getTipoArquivo() {
        return tipoArquivo;
    }

    public void setTipoArquivo(String tipoArquivo) {
        this.tipoArquivo = tipoArquivo;
    }

    public String getNomeOriginal() {
        return nomeOriginal;
    }

    public void setNomeOriginal(String nomeOriginal) {
        this.nomeOriginal = nomeOriginal;
    }

    public String getChaveStorage() {
        return chaveStorage;
    }

    public void setChaveStorage(String chaveStorage) {
        this.chaveStorage = chaveStorage;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public long getTamanhoBytes() {
        return tamanhoBytes;
    }

    public void setTamanhoBytes(long tamanhoBytes) {
        this.tamanhoBytes = tamanhoBytes;
    }

    public int getVersao() {
        return versao;
    }

    public void setVersao(int versao) {
        this.versao = versao;
    }

    public Usuario getUploadedPor() {
        return uploadedPor;
    }

    public void setUploadedPor(Usuario uploadedPor) {
        this.uploadedPor = uploadedPor;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(Instant criadoEm) {
        this.criadoEm = criadoEm;
    }
}
