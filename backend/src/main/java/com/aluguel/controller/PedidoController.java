package com.aluguel.controller;
import com.aluguel.model.*;
import com.aluguel.repository.Repositories.*;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
@RestController @RequestMapping("/api/pedidos")
public class PedidoController {
  public record PedidoDto(Long automovelId, LocalDate dataInicio, LocalDate dataFim) {}
  public record AvaliacaoDto(boolean aprovado, String parecer) {}
  private final PedidoRepo pedidos; private final ClienteRepo clientes; private final AutomovelRepo autos;
  public PedidoController(PedidoRepo p, ClienteRepo c, AutomovelRepo a) { pedidos = p; clientes = c; autos = a; }

  private static boolean agente(Authentication a) {
    return a.getAuthorities().stream().anyMatch(g -> !g.getAuthority().equals("ROLE_CLIENTE"));
  }
  private Pedido buscar(Long id, Authentication a) {
    Pedido p = pedidos.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    if (!agente(a) && !p.cliente.usuario.username.equals(a.getName())) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
    return p;
  }
  private void aplicar(Pedido p, PedidoDto d) {
    p.automovel = autos.findById(d.automovelId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "automóvel inválido"));
    p.dataInicio = d.dataInicio(); p.dataFim = d.dataFim();
  }

  @GetMapping public List<Pedido> listar(Authentication a) {
    return agente(a) ? pedidos.findAll() : pedidos.findByClienteUsuarioUsername(a.getName());
  }
  @GetMapping("/{id}") public Pedido consultar(@PathVariable Long id, Authentication a) { return buscar(id, a); }

  @PostMapping @PreAuthorize("hasRole('CLIENTE')")
  public Pedido introduzir(@RequestBody PedidoDto d, Authentication a) {
    Pedido p = new Pedido();
    p.cliente = clientes.findByUsuarioUsername(a.getName()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "cliente sem cadastro"));
    aplicar(p, d); return pedidos.save(p);
  }
  @PutMapping("/{id}")
  public Pedido modificar(@PathVariable Long id, @RequestBody PedidoDto d, Authentication a) {
    Pedido p = buscar(id, a);
    if (p.status != StatusPedido.PENDENTE) throw new ResponseStatusException(HttpStatus.CONFLICT, "só pedidos PENDENTES podem ser modificados");
    aplicar(p, d); return pedidos.save(p);
  }
  @DeleteMapping("/{id}") @PreAuthorize("hasRole('CLIENTE')")
  public Pedido cancelar(@PathVariable Long id, Authentication a) {
    Pedido p = buscar(id, a);
    if (p.status == StatusPedido.CONTRATADO) throw new ResponseStatusException(HttpStatus.CONFLICT, "pedido já contratado");
    p.status = StatusPedido.CANCELADO; return pedidos.save(p);
  }
  @PutMapping("/{id}/avaliar") @PreAuthorize("hasAnyRole('EMPRESA','BANCO')")
  public Pedido avaliar(@PathVariable Long id, @RequestBody AvaliacaoDto d, Authentication a) {
    Pedido p = buscar(id, a);
    if (p.status != StatusPedido.PENDENTE) throw new ResponseStatusException(HttpStatus.CONFLICT, "pedido não está PENDENTE");
    p.status = d.aprovado() ? StatusPedido.APROVADO : StatusPedido.REPROVADO;
    p.parecerFinanceiro = d.parecer(); return pedidos.save(p);
  }
}
