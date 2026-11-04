package com.aluguel.repository;
import com.aluguel.model.*;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
public class Repositories {
  public interface UsuarioRepo extends JpaRepository<Usuario, Long> { Optional<Usuario> findByUsername(String u); }
  public interface ClienteRepo extends JpaRepository<Cliente, Long> { Optional<Cliente> findByUsuarioUsername(String u); }
  public interface AutomovelRepo extends JpaRepository<Automovel, Long> {}
  public interface PedidoRepo extends JpaRepository<Pedido, Long> { List<Pedido> findByClienteUsuarioUsername(String u); }
  public interface ContratoRepo extends JpaRepository<Contrato, Long> {
    @Query("select c from Contrato c left join c.agente ag left join c.bancoCredor b "
         + "where c.pedido.cliente.usuario.username = :u or ag.username = :u or b.username = :u")
    List<Contrato> findDoParticipante(@Param("u") String u);
  }
}