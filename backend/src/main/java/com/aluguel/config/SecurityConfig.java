package com.aluguel.config;
import com.aluguel.repository.Repositories.UsuarioRepo;
import org.springframework.context.annotation.*;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
@Configuration @EnableMethodSecurity
public class SecurityConfig {
  @Bean SecurityFilterChain chain(HttpSecurity http) throws Exception {
    return http.csrf(AbstractHttpConfigurer::disable)
      .authorizeHttpRequests(a -> a.requestMatchers("/api/auth/register").permitAll().anyRequest().authenticated())
      .httpBasic(Customizer.withDefaults()).build();
  }
  @Bean PasswordEncoder encoder() { return new BCryptPasswordEncoder(); }
  @Bean UserDetailsService uds(UsuarioRepo repo) {
    return u -> repo.findByUsername(u)
      .map(x -> User.withUsername(x.username).password(x.senha).roles(x.papel.name()).build())
      .orElseThrow(() -> new UsernameNotFoundException(u));
  }
}
