package com.aluguel.model;
import jakarta.persistence.*;
@Entity @Table(name = "automoveis")
public class Automovel {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  public String matricula; public Integer ano; public String marca; public String modelo;
  @Column(unique = true) public String placa;
}
