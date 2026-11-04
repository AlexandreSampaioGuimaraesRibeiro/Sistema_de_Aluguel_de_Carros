package com.aluguel.controller;
import com.aluguel.model.Automovel;
import com.aluguel.repository.Repositories.AutomovelRepo;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/automoveis")
public class AutomovelController {
  private final AutomovelRepo repo;
  public AutomovelController(AutomovelRepo r) { repo = r; }
  @GetMapping public List<Automovel> listar() { return repo.findAll(); }
  @PostMapping @PreAuthorize("hasAnyRole('EMPRESA','BANCO')")
  public Automovel criar(@RequestBody Automovel a) { return repo.save(a); }
}
