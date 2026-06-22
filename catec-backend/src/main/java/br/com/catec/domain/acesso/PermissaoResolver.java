package br.com.catec.domain.acesso;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import org.springframework.stereotype.Component;

@Component
public class PermissaoResolver {

    public ResolvedAccess resolve(Collection<UsuarioGrupo> vinculos) {
        Set<String> grupos = new TreeSet<>();
        Set<String> permissoes = new TreeSet<>();
        if (vinculos == null) {
            return new ResolvedAccess(List.of(), List.of());
        }
        for (UsuarioGrupo vinculo : vinculos) {
            if (vinculo == null || vinculo.getGrupo() == null) {
                continue;
            }
            GrupoAcesso grupo = vinculo.getGrupo();
            if (!grupo.isAtivo()) {
                continue;
            }
            grupos.add(grupo.getCodigo());
            for (Permissao permissao : grupo.getPermissoes()) {
                permissoes.add(permissao.getCodigo());
            }
        }
        return new ResolvedAccess(List.copyOf(grupos), List.copyOf(permissoes));
    }

    public record ResolvedAccess(List<String> grupos, List<String> permissoes) {}
}
