# Modelos UML (versão 1)

## Diagrama de classes
```mermaid
classDiagram
  class Usuario { +Long id; +String username; +String senha; +Papel papel }
  class Cliente { +Long id; +String rg; +String cpf; +String nome; +String endereco; +String profissao }
  class Rendimento { +Long id; +String entidadeEmpregadora; +BigDecimal valor }
  class Automovel { +Long id; +String matricula; +Integer ano; +String marca; +String modelo; +String placa }
  class Pedido { +Long id; +LocalDate dataInicio; +LocalDate dataFim; +StatusPedido status; +String parecerFinanceiro }
  class Contrato { +Long id; +TipoPropriedade propriedade; +BigDecimal valorCredito }
  Usuario "1" -- "0..1" Cliente
  Cliente "1" *-- "0..3" Rendimento
  Cliente "1" -- "*" Pedido
  Automovel "1" -- "*" Pedido
  Pedido "1" -- "0..1" Contrato
  Contrato "*" -- "0..1" Usuario : bancoCredor (papel BANCO)
```

## Arquitetura (MVC)
```mermaid
flowchart LR
  V["View: React + Vite"] -->|"REST/JSON + HTTP Basic"| C["Controller: *Controller"]
  C --> M["Model: entidades + Repositories (JPA)"]
  M --> DB[("Supabase PostgreSQL")]
```
Subsistemas: (1) gestão de pedidos e contratos = back-end Spring Boot; (2) construção dinâmica das páginas = front-end React.

## Fluxo do pedido
PENDENTE → (agente avalia) APROVADO | REPROVADO → (agente executa contrato) CONTRATADO. O cliente pode cancelar até CONTRATADO.

## Diagrama de implantação
```mermaid
flowchart LR
  C["Navegador do cliente"] -->|HTTPS| S
  E["Navegador da empresa (agente)"] -->|HTTPS| S
  B["Navegador do banco (agente)"] -->|HTTPS| S
  S["Servidor central<br/>Spring Boot + React"] -->|JDBC/SSL| D[("Supabase PostgreSQL")]
```
Clientes e agentes acessam o servidor central pela Internet. A propriedade do automóvel e o crédito bancário ficam registrados no **contrato**.