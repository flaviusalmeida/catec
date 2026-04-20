package br.com.catec.api.v1.projeto;

import br.com.catec.domain.cliente.Cliente;
import br.com.catec.domain.cliente.ClienteRepository;
import br.com.catec.domain.projeto.Projeto;
import br.com.catec.domain.projeto.ProjetoRepository;
import br.com.catec.domain.projeto.ProjetoStatus;
import br.com.catec.domain.usuario.Usuario;
import br.com.catec.domain.usuario.UsuarioRepository;
import br.com.catec.security.UsuarioAutenticado;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProjetoService {

    private final ProjetoRepository projetoRepository;
    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;

    public ProjetoService(
            ProjetoRepository projetoRepository,
            ClienteRepository clienteRepository,
            UsuarioRepository usuarioRepository) {
        this.projetoRepository = projetoRepository;
        this.clienteRepository = clienteRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<ProjetoResponse> listar(UsuarioAutenticado principal) {
        Sort sort = Sort.by(Sort.Direction.DESC, "criadoEm");
        List<Projeto> rows =
                isAdministrativo(principal)
                        ? projetoRepository.findAll(sort)
                        : projetoRepository.findAllByCriadoPorId(principal.id(), sort);
        return rows.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProjetoResponse obter(Long id, UsuarioAutenticado principal) {
        Projeto p = loadOrNotFound(id);
        garantirLeitura(p, principal);
        return toResponse(p);
    }

    @Transactional
    public ProjetoResponse criar(ProjetoCreateRequest req, UsuarioAutenticado principal) {
        Cliente cliente = clienteRepository
                .findById(req.clienteId())
                .orElseThrow(() -> badRequest("Cliente não encontrado. Indique um clienteId válido."));
        Instant agora = Instant.now();
        Usuario criador = usuarioRepository
                .findById(principal.id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão inválida."));
        Projeto p = new Projeto();
        p.setCliente(cliente);
        p.setTitulo(req.titulo().trim());
        p.setEscopo(req.escopo().trim());
        aplicarContatoDoCliente(cliente, p);
        p.setCriadoPor(criador);
        p.setStatus(ProjetoStatus.CRIADO);
        p.setCriadoEm(agora);
        p.setAtualizadoEm(agora);
        return toResponse(projetoRepository.save(p));
    }

    @Transactional
    public ProjetoResponse atualizar(Long id, ProjetoUpdateRequest req, UsuarioAutenticado principal) {
        Projeto p = loadOrNotFound(id);
        boolean admin = isAdministrativo(principal);

        if (!admin) {
            if (!p.getCriadoPor().getId().equals(principal.id())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Só o criador pode editar esta demanda.");
            }
            if (p.getStatus() != ProjetoStatus.CRIADO) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN, "Só é possível editar a demanda enquanto estiver no estado Criado.");
            }
            if (req.clienteId() != null && !req.clienteId().equals(p.getCliente().getId())) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN, "Colaborador não pode alterar o cliente vinculado ao projeto.");
            }
            if (req.status() != null && req.status() != p.getStatus()) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN, "Apenas o administrativo pode alterar o estado do projeto.");
            }
        }

        Instant agora = Instant.now();

        if (admin && req.clienteId() != null && !req.clienteId().equals(p.getCliente().getId())) {
            Cliente novo = clienteRepository
                    .findById(req.clienteId())
                    .orElseThrow(() -> badRequest("Cliente não encontrado. Indique um clienteId válido."));
            p.setCliente(novo);
        }

        if (req.titulo() != null) {
            String t = req.titulo().trim();
            if (t.isEmpty()) {
                throw badRequest("Título não pode ser vazio.");
            }
            p.setTitulo(t);
        }
        if (req.escopo() != null) {
            String e = req.escopo().trim();
            if (e.isEmpty()) {
                throw badRequest("Escopo não pode ser vazio.");
            }
            p.setEscopo(e);
        }

        if (admin && req.status() != null && req.status() != p.getStatus()) {
            validarTransicao(p.getStatus(), req.status());
            p.setStatus(req.status());
        }

        aplicarContatoDoCliente(p.getCliente(), p);

        p.setAtualizadoEm(agora);
        return toResponse(projetoRepository.save(p));
    }

    private void validarTransicao(ProjetoStatus atual, ProjetoStatus novo) {
        boolean ok =
                switch (atual) {
                    case CRIADO -> novo == ProjetoStatus.AGUARDANDO_ADM;
                    case AGUARDANDO_ADM -> novo == ProjetoStatus.EM_PROPOSTA;
                    case EM_PROPOSTA -> false;
                };
        if (!ok) {
            throw badRequest(
                    "Transição de estado inválida: de %s não é permitido passar para %s."
                            .formatted(labelEstado(atual), labelEstado(novo)));
        }
    }

    private static String labelEstado(ProjetoStatus s) {
        return switch (s) {
            case CRIADO -> "Criado";
            case AGUARDANDO_ADM -> "Aguardando administrativo";
            case EM_PROPOSTA -> "Em proposta";
        };
    }

    private Projeto loadOrNotFound(Long id) {
        return projetoRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Projeto não encontrado."));
    }

    private void garantirLeitura(Projeto p, UsuarioAutenticado principal) {
        if (isAdministrativo(principal)) {
            return;
        }
        if (!p.getCriadoPor().getId().equals(principal.id())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a este projeto.");
        }
    }

    private static boolean isAdministrativo(UsuarioAutenticado principal) {
        for (GrantedAuthority a : principal.getAuthorities()) {
            if ("ROLE_ADMINISTRATIVO".equals(a.getAuthority())) {
                return true;
            }
        }
        return false;
    }

    /** Copia e-mail e telefone do cadastro do cliente para o projeto (obrigatório e-mail no cliente). */
    private void aplicarContatoDoCliente(Cliente cliente, Projeto p) {
        String em = cliente.getEmail();
        if (em == null || em.isBlank()) {
            throw badRequest(
                    "O cliente selecionado não tem e-mail cadastrado. Atualize o cadastro do cliente antes de registrar a demanda.");
        }
        p.setEmailContato(em.trim().toLowerCase(Locale.ROOT));
        p.setTelefoneContato(normalizarTelefoneOpcional(cliente.getTelefone()));
    }

    private ProjetoResponse toResponse(Projeto p) {
        Cliente c = p.getCliente();
        return new ProjetoResponse(
                p.getId(),
                c.getId(),
                c.getRazaoSocialOuNome(),
                p.getTitulo(),
                p.getEscopo(),
                emailContatoParaResposta(c, p),
                telefoneContatoParaResposta(c, p),
                p.getCriadoPor().getId(),
                p.getCriadoPor().getNome(),
                p.getStatus(),
                p.getCriadoEm(),
                p.getAtualizadoEm());
    }

    /**
     * E-mail mostrado na API: cadastro atual do cliente, com fallback ao valor gravado na demanda (ex.: cliente sem
     * e-mail hoje).
     */
    private static String emailContatoParaResposta(Cliente c, Projeto p) {
        String em = c.getEmail();
        if (em != null && !em.isBlank()) {
            return em.trim().toLowerCase(Locale.ROOT);
        }
        return p.getEmailContato();
    }

    /**
     * Telefone mostrado na API: cadastro atual do cliente, com fallback ao valor gravado na demanda (ex.: projetos
     * antigos ou antes de sincronizar).
     */
    private static String telefoneContatoParaResposta(Cliente c, Projeto p) {
        String tel = c.getTelefone();
        if (tel != null && !tel.isBlank()) {
            return tel;
        }
        return p.getTelefoneContato();
    }

    /** Telefone opcional: vazio ou null grava null; caso contrário 10–11 dígitos (DDD + número). */
    private static String normalizarTelefoneOpcional(String raw) {
        if (raw == null) {
            return null;
        }
        String d = apenasDigitos(raw);
        if (d.isEmpty()) {
            return null;
        }
        if (d.length() < 10 || d.length() > 11) {
            throw badRequest("Telefone inválido. Informe DDD + número com 10 ou 11 dígitos.");
        }
        if (d.charAt(0) == '0') {
            throw badRequest("Telefone inválido.");
        }
        return d;
    }

    private static String apenasDigitos(String value) {
        StringBuilder sb = new StringBuilder(value.length());
        for (int i = 0; i < value.length(); i++) {
            char ch = value.charAt(i);
            if (ch >= '0' && ch <= '9') {
                sb.append(ch);
            }
        }
        return sb.toString();
    }

    private static ResponseStatusException badRequest(String msg) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, msg);
    }
}
