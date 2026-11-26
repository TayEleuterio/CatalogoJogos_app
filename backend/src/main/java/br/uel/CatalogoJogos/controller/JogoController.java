package br.uel.CatalogoJogos.controller;

import br.uel.CatalogoJogos.model.Jogo;
import br.uel.CatalogoJogos.service.JogoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jogos")
@CrossOrigin(origins = "*")
public class JogoController {

    @Autowired
    private JogoService service;

    @GetMapping
    public List<Jogo> listarJogos(@RequestParam(required = false) String buscar,
                                  @RequestParam(defaultValue = "titulo") String ordem,
                                  @RequestParam(defaultValue = "asc") String dir) {
        return service.buscarEOrdenar(buscar, ordem, dir);
    }

    @GetMapping("/{id}")
    public Jogo buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<Jogo> criarJogo(@Valid @RequestBody Jogo jogo) {
        jogo.setId(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.salvar(jogo));
    }

    @PutMapping("/{id}")
    public Jogo atualizarJogo(@PathVariable Long id, @Valid @RequestBody Jogo jogo) {
        return service.atualizar(id, jogo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirJogo(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> tratarValidacao(MethodArgumentNotValidException ex) {
        Map<String, String> erros = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> erros.put(e.getField(), e.getDefaultMessage().trim()));
        return ResponseEntity.badRequest().body(erros);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> tratarStatus(ResponseStatusException ex) {
        Map<String, String> corpo = Map.of("erro", ex.getReason() != null ? ex.getReason() : "Erro na requisição.");
        return ResponseEntity.status(ex.getStatusCode()).body(corpo);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> tratarJsonInvalido(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest()
                .body(Map.of("erro", "Dados inválidos. Verifique os campos (data no formato AAAA-MM-DD)."));
    }
}