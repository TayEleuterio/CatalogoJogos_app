package br.uel.CatalogoJogos.service;

import br.uel.CatalogoJogos.model.Jogo;
import br.uel.CatalogoJogos.repository.JogoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class JogoService {
    private static final List<String> CAMPOS_ORDENAVEIS = List.of("titulo", "preco",
"dataLancamento");

    @Autowired
    private JogoRepository jogoRepository;

    //busca com filtro de título e ordenação por coluna
    public List<Jogo> buscarEOrdenar(String titulo, String campoOrdem,String direcao) {
        if (!CAMPOS_ORDENAVEIS.contains(campoOrdem)) {
            campoOrdem = "titulo";
        }

        Sort sort = "desc".equalsIgnoreCase(direcao) 
            ? Sort.by(campoOrdem).descending() 
            : Sort.by(campoOrdem).ascending();

        if (titulo != null && !titulo.isBlank()) {
            return jogoRepository.findByTituloContainingIgnoreCase(titulo.trim(), sort);
        }
        return jogoRepository.findAll(sort);
    }

    //salvar jogo
    public Jogo salvar(Jogo jogo) {
        return jogoRepository.save(jogo);
    }

    //atualizar jogo
    public Jogo atualizar(Long id, Jogo dadosAtualizados) {
        Jogo existente = buscarPorId(id);
        existente.setTitulo(dadosAtualizados.getTitulo());
        existente.setGenero(dadosAtualizados.getGenero());
        existente.setPreco(dadosAtualizados.getPreco());
        existente.setDataLancamento(dadosAtualizados.getDataLancamento());
        existente.setUrlCapa(dadosAtualizados.getUrlCapa());
        existente.setDescricao(dadosAtualizados.getDescricao());
        return jogoRepository.save(existente);
    }

    //busca por ID para edição
    public  Jogo buscarPorId(Long id){
        return jogoRepository.findById(id)
                .orElseThrow(()  -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Jogo não encontrado."));
    }

    //excluir por id
    public void excluir(Long id) {
        if (!jogoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Jogo não encontrado para exclusão.");
        }
        jogoRepository.deleteById(id);
    }
}