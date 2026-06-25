# Guia de Apresentação: POO no Simulador de Futebol (Football Manager 2026)

Este guia descreve detalhadamente a arquitetura do projeto e como os quatro pilares fundamentais da **Programação Orientada a Objetos (POO)** foram aplicados no desenvolvimento deste jogo. Você pode usar este material como roteiro para a sua apresentação ou como material de estudo.

---

## 🏗️ 1. Arquitetura Geral do Projeto

O sistema adota uma separação clara entre **Modelos de Domínio** (que contêm dados e regras de negócio essenciais) e **Controladores** (que orquestram o fluxo da aplicação e a interação com o usuário).

### 📊 Diagrama de Arquitetura do Projeto
Abaixo está o fluxo completo de execução e comunicação entre os controladores e os modelos:

![Diagrama de Arquitetura](arquitetura_projeto_soccer_pt.png)

### 📐 Diagrama de Classes (UML)
Abaixo está a estrutura de modelagem das classes e os seus relacionamentos na Programação Orientada a Objetos:

![Diagrama de Classes](diagrama_classes_poo_pt.png)

### Arquivos Principais do Projeto
- **Entry Point (Ponto de Entrada):** [main.ts](file:///c:/Users/Redes/Desktop/soccer/main.ts) - Apenas instancia o controlador principal e inicia o jogo.
- **Modelos (Models):**
  - [Person.ts](file:///c:/Users/Redes/Desktop/soccer/models/Person.ts)
  - [Player.ts](file:///c:/Users/Redes/Desktop/soccer/models/Player.ts)
  - [Economia.ts](file:///c:/Users/Redes/Desktop/soccer/models/Economia.ts)
  - [Team.ts](file:///c:/Users/Redes/Desktop/soccer/models/Team.ts)
- **Controladores (Controllers):**
  - [UIController.ts](file:///c:/Users/Redes/Desktop/soccer/controllers/UIController.ts)
  - [MenuController.ts](file:///c:/Users/Redes/Desktop/soccer/controllers/MenuController.ts)
  - [CampaignController.ts](file:///c:/Users/Redes/Desktop/soccer/controllers/CampaignController.ts)
  - [MatchController.ts](file:///c:/Users/Redes/Desktop/soccer/controllers/MatchController.ts)
  - [LineupController.ts](file:///c:/Users/Redes/Desktop/soccer/controllers/LineupController.ts)

---

## 🔑 2. Aplicação dos Pilares de POO

### A. Abstração (Abstraction)
A **Abstração** consiste em focar nos aspectos essenciais de uma entidade do mundo real, ignorando os detalhes menos relevantes para o contexto do sistema.

- **Onde ocorre:** No arquivo [Person.ts](file:///c:/Users/Redes/Desktop/soccer/models/Person.ts).
- **Como foi aplicado:** A classe [Person](file:///c:/Users/Redes/Desktop/soccer/models/Person.ts) é declarada como `export abstract class Person`. Isso significa que:
  1. Ela serve apenas como um "molde" ou superclasse estrutural.
  2. Não é permitido criar uma pessoa genérica diretamente (ex: `new Person()` causa erro de compilação).
  3. Ela abstrai características comuns a qualquer pessoa envolvida no futebol (como nome, idade, stamina, overall e valor de mercado).

### B. Herança (Inheritance)
A **Herança** permite que uma classe (subclasse) herde atributos e métodos de outra classe (superclasse), promovendo o reuso de código.

- **Onde ocorre:** No arquivo [Player.ts](file:///c:/Users/Redes/Desktop/soccer/models/Player.ts).
- **Como foi aplicado:** A classe [Player](file:///c:/Users/Redes/Desktop/soccer/models/Player.ts) herda da classe abstrata [Person](file:///c:/Users/Redes/Desktop/soccer/models/Person.ts):
  ```typescript
  export class Player extends Person {
    constructor(...) {
      super(...); // Invoca o construtor da superclasse Person
    }
  }
  ```
  Isso evita a duplicação de getters, setters e campos como `name`, `stamina`, `overall`, etc., herdando toda essa lógica pronta.

### C. Encapsulamento (Encapsulation)
O **Encapsulamento** protege o estado interno de um objeto contra acessos diretos e modificações indevidas, expondo apenas métodos públicos controlados.

- **Onde ocorre:** Em todos os modelos, mas com destaque em [Person.ts](file:///c:/Users/Redes/Desktop/soccer/models/Person.ts) e [Economia.ts](file:///c:/Users/Redes/Desktop/soccer/models/Economia.ts).
- **Como foi aplicado:**
  - **Uso de modificadores de acesso:** Atributos marcados como `private` (privados) ou `protected` (protegidos contra acesso externo, permitidos para subclasses).
  - **Métodos Acessores (Getters e Setters) com Validação:**
    - Em [Person.ts](file:///c:/Users/Redes/Desktop/soccer/models/Person.ts):
      ```typescript
      public set overall(value: number) {
        if (value < 1 || value > 100) {
          throw new Error("Overall deve estar entre 1 e 100.");
        }
        this._overall = value;
      }
      ```
      Aqui, o setter garante que nenhuma parte externa defina um overall inválido (como 150 ou -10).
    - Em [Economia.ts](file:///c:/Users/Redes/Desktop/soccer/models/Economia.ts):
      ```typescript
      public debitar(valor: number): void {
        if (valor > this._saldo) {
          throw new Error("Saldo insuficiente para realizar a transação.");
        }
        this._saldo -= valor;
      }
      ```
      Impede que a conta do clube fique com saldo negativo ilegalmente.

### D. Composição / Associação (Composition & Association)
A **Composição** e a **Associação** definem relacionamentos entre classes onde uma classe "tem um" ou "usa" outra.

- **Onde ocorre:** No arquivo [Team.ts](file:///c:/Users/Redes/Desktop/soccer/models/Team.ts).
- **Como foi aplicado:**
  - A classe [Team](file:///c:/Users/Redes/Desktop/soccer/models/Team.ts) possui uma composição com a classe [Player](file:///c:/Users/Redes/Desktop/soccer/models/Player.ts) (um time contém um array de jogadores: `private _players: Player[]`).
  - Possui também composição com a classe [Economia](file:///c:/Users/Redes/Desktop/soccer/models/Economia.ts) (um time contém uma carteira financeira própria: `private _economia: Economia`).
  - O ciclo de vida desses objetos está acoplado: o time orquestra o recálculo dos atributos de seus jogadores coletivamente via `recalculateOveralls()`.

---

## 🛠️ 3. O papel dos Controladores (Controllers)

Os controladores implementam as regras de fluxo do jogo e manipulam as instâncias dos modelos:

1. **[UIController.ts](file:///c:/Users/Redes/Desktop/soccer/controllers/UIController.ts):**
   - Centraliza todas as operações de Entrada e Saída (I/O) no terminal.
   - Gerencia a formatação visual, telas de carregamento, e as animações com a bola `⚽` girando.
2. **[MenuController.ts](file:///c:/Users/Redes/Desktop/soccer/controllers/MenuController.ts):**
   - Controla o Menu Principal (Nova Campanha, Carregar, Instruções). Ele decide qual ação tomar com base nas entradas.
3. **[CampaignController.ts](file:///c:/Users/Redes/Desktop/soccer/controllers/CampaignController.ts):**
   - Gerencia o estado de uma campanha (temporada atual, rodada, tabela de pontuação e o loop principal do jogo).
4. **[MatchController.ts](file:///c:/Users/Redes/Desktop/soccer/controllers/MatchController.ts):**
   - Contém toda a lógica matemática para simular os confrontos, aplicar desgaste de stamina (fadiga) nos jogadores, e pagar prêmios financeiros aos times conforme as vitórias ou empates.
5. **[LineupController.ts](file:///c:/Users/Redes/Desktop/soccer/controllers/LineupController.ts):**
   - Responsável pelas táticas e escalação de time dos rivais e do usuário.

---

## 🧑‍🏫 Roteiro Sugerido para Apresentar na Aula

Aqui está um roteiro simples de 5 minutos para apresentar no telão:

1. **Introdução (1 min):**
   > *"Olá a todos. Nós desenvolvemos um simulador de gerenciamento de futebol em modo texto no terminal (estilo Football Manager). Nele, o usuário escolhe um time, gerencia finanças, escala jogadores em formações táticas, treina o elenco e joga partidas simuladas ao longo de uma temporada."*

2. **Arquitetura e Classes (1.5 min):**
   > *"Para modelar o jogo de forma eficiente, usamos POO. Criamos uma classe abstrata chamada `Person` para fins de **Abstração**. Dela herdamos a classe `Player` usando **Herança**. Cada time (`Team`) é composto de múltiplos `Players` e uma instância da classe `Economia` representando **Composição**."*

3. **Demonstração do Encapsulamento (1.5 min):**
   > *"Aplicamos **Encapsulamento** de forma rígida. Os atributos como saldo de caixa e overall dos jogadores são privados e acessados apenas por Getters e Setters. Isso garante que a integridade dos dados seja mantida: por exemplo, um jogador nunca terá overall abaixo de 1 ou acima de 100, e um time nunca poderá gastar mais do que tem em saldo, lançando exceções caso isso aconteça."*

4. **Interface e Animações (1 min):**
   > *"Para melhorar a experiência do usuário (UX), implementamos um controlador de UI dedicado que lida com animações assíncronas do terminal. Por exemplo, ao pausar o jogo ou ao navegar pelas opções dos menus, exibimos animações da bola `⚽` girando, o que deixa o jogo em linha de comando mais vivo e interativo."*
