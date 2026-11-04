package com.aluguel.model;
import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
@Entity @Table(name = "clientes")
public class Cliente {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  @OneToOne public Usuario usuario;
  @NotBlank public String rg;
  @NotBlank public String cpf;
  @NotBlank public String nome;
  @NotBlank public String endereco;
  public String profissao;
  @Valid @Size(max = 3, message = "máximo de 3 rendimentos")
  @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
  public List<Rendimento> rendimentos = new ArrayList<>();
}
