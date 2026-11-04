package com.aluguel.model;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
@Entity @Table(name = "usuarios")
public class Usuario {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  @NotBlank @Column(unique = true) public String username;
  @NotBlank @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) public String senha;
  @Enumerated(EnumType.STRING) public Papel papel = Papel.CLIENTE;
}
