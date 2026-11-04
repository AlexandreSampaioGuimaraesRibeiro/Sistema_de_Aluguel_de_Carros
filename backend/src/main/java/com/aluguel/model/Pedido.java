package com.aluguel.model;
import jakarta.persistence.*;
import java.time.LocalDate;
@Entity @Table(name = "pedidos")
public class Pedido {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  @ManyToOne public Cliente cliente;
  @ManyToOne public Automovel automovel;
  public LocalDate dataInicio; public LocalDate dataFim;
  @Enumerated(EnumType.STRING) public StatusPedido status = StatusPedido.PENDENTE;
  public String parecerFinanceiro;
}
