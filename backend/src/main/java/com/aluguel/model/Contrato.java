package com.aluguel.model;
import jakarta.persistence.*;
import java.math.BigDecimal;
@Entity @Table(name = "contratos")
public class Contrato {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  @OneToOne public Pedido pedido;
  @Enumerated(EnumType.STRING) public TipoPropriedade propriedade;
  @ManyToOne public Usuario bancoCredor;
  public BigDecimal valorCredito;
}
