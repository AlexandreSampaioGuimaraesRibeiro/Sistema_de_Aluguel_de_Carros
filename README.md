# Sistema de Aluguel de Carros
Java 25 · Spring Boot 4.0.x · Maven · React + Vite · Supabase (PostgreSQL)

## Rodar
**Back-end** (dados em Supabase: Project Settings > Database)
```
export SUPABASE_DB_URL="jdbc:postgresql://<host>:5432/postgres?sslmode=require"
export SUPABASE_DB_USER=postgres SUPABASE_DB_PASSWORD=<senha>
cd backend && mvn spring-boot:run
```
(no Windows: use `set` em vez de `export`)

**Front-end**: `cd frontend && npm install && npm run dev` (proxy `/api` → `localhost:8080`)

## Uso
1. Cadastre um BANCO ou EMPRESA e um CLIENTE (tela de cadastro).
2. O agente cria automóveis: `POST /api/automoveis` (autenticado).
3. Cliente cria/consulta/cancela pedidos; agente avalia e gera contrato (crédito só para BANCO).

Modelos UML em `docs/modelos.md`: mantenha-os versionados e atualizados no GitHub.
