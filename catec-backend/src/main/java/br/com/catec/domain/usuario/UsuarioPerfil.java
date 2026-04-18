package br.com.catec.domain.usuario;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "usuario_perfil")
public class UsuarioPerfil {

    public UsuarioPerfil() {}

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 30)
    private String perfil;

    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm;

    public Long getId() {
        return id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getPerfil() {
        return perfil;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public void setPerfil(String perfil) {
        this.perfil = perfil;
    }

    public void setCriadoEm(Instant criadoEm) {
        this.criadoEm = criadoEm;
    }

    public static UsuarioPerfil associar(Usuario usuario, PerfilMacro perfil) {
        var row = new UsuarioPerfil();
        row.usuario = usuario;
        row.perfil = perfil.name();
        row.criadoEm = Instant.now();
        return row;
    }
}
