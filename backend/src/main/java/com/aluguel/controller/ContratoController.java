package com.aluguel.controller;
import com.aluguel.model.*;
import com.aluguel.repository.Repositories.*;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
@RestController @RequestMapping("/api/contratos") @PreAuthorize("hasAnyRole('EMPRESA','BANCO')")
public class ContratoController {
  public record ContratoDto(Long pedidoId, TipoPropriedade propriedade, boolean comCredito, BigDecimal valorCredito) {}
  private final ContratoRepo contratos; private final PedidoRepo pedidos; private final UsuarioRepo usuarios;
  public ContratoController(ContratoRepo c, PedidoRepo p, UsuarioRepo u) { contratos = c; pedidos = p; usuarios = u; }
  @GetMapping public List<Contrato> listar() { return contratos.findAll(); }
  @PostMapping
  public Contrato executar(@RequestBody ContratoDto d, Authentication a) {
    Pedido p = pedidos.findById(d.pedidoId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    if (p.status != StatusPedido.APROVADO) throw new ResponseStatusException(HttpStatus.CONFLICT, "apenas pedidos APROVADOS geram contrato");
    Contrato c = new Contrato(); c.pedido = p; c.propriedade = d.propriedade();
    if (d.comCredito()) {
      Usuario u = usuarios.findByUsername(a.getName()).orElseThrow();
      if (u.papel != Papel.BANCO) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "crédito só por banco");
      c.bancoCredor = u; c.valorCredito = d.valorCredito();
    }
    p.status = StatusPedido.CONTRATADO; pedidos.save(p);
    return contratos.save(c);
  }
}
