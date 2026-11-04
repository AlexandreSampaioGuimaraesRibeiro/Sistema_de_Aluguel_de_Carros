package com.aluguel.controller;
import com.aluguel.model.*;
import com.aluguel.repository.Repositories.*;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth")
public class AuthController {
  public record RegisterDto(@Valid Usuario usuario, @Valid Cliente cliente) {}
  private final UsuarioRepo usuarios; private final ClienteRepo clientes; private final PasswordEncoder enc;
  public AuthController(UsuarioRepo u, ClienteRepo c, PasswordEncoder e) { usuarios = u; clientes = c; enc = e; }

  @PostMapping("/register") @Transactional
  public ResponseEntity<?> register(@RequestBody @Valid RegisterDto dto) {
    if (usuarios.findByUsername(dto.usuario().username).isPresent())
      return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("erro", "usuário já existe"));
    Usuario u = dto.usuario(); u.senha = enc.encode(u.senha); usuarios.save(u);
    if (u.papel == Papel.CLIENTE && dto.cliente() != null) { dto.cliente().usuario = u; clientes.save(dto.cliente()); }
    return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", u.id));
  }
  @GetMapping("/me")
  public Map<String, Object> me(Authentication a) { return Map.of("username", a.getName(), "papeis", a.getAuthorities().toString()); }
}
