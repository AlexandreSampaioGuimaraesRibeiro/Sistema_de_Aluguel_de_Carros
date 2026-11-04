package com.aluguel.repository;
import com.aluguel.model.*;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public class Repositories {
  public interface UsuarioRepo extends JpaRepository<Usuario, Long> { Optional<Usuario> findByUsername(String u); }
  public interface ClienteRepo extends JpaRepository<Cliente, Long> { Optional<Cliente> findByUsuarioUsername(String u); }
  public interface AutomovelRepo extends JpaRepository<Automovel, Long> {}
  public interface PedidoRepo extends JpaRepository<Pedido, Long> { List<Pedido> findByClienteUsuarioUsername(String u); }
  public interface ContratoRepo extends JpaRepository<Contrato, Long> {}
}
