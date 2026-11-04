package com.aluguel.model;
import jakarta.persistence.*;
import java.math.BigDecimal;
@Entity @Table(name = "rendimentos")
public class Rendimento {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  public String entidadeEmpregadora;
  public BigDecimal valor;
}
