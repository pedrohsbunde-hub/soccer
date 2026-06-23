import { Player, Position } from "./Player";

describe("Player Class (Domain Model)", () => {
  // Teste 1: Inicialização de jogador com valores personalizados (Happy Path)
  test("deve inicializar um jogador com valores personalizados corretamente", () => {
    // Arrange
    const name = "Neymar Jr";
    const position = Position.ATA;
    const overall = 85;
    const transfer = 9000;
    const age = 30;
    const number = 10;
    const stamina = 95;

    // Act
    const player = new Player(name, position, overall, transfer, age, number, stamina);

    // Assert
    expect(player.name).toBe(name);
    expect(player.position).toBe(position);
    expect(player.overall).toBe(overall);
    expect(player.transfer).toBe(transfer);
    expect(player.age).toBe(age);
    expect(player.Number).toBe(number);
    expect(player.stamina).toBe(stamina);
  });

  // Teste 2: Clamping de Stamina (Happy/Edge Path)
  test("deve limitar a stamina no intervalo [0, 100]", () => {
    // Arrange
    const player = new Player("Gabriel", Position.DEF, 40, 5000, 22, 4, 100);

    // Act & Assert (Acima de 100)
    player.stamina = 150;
    expect(player.stamina).toBe(100);

    // Act & Assert (Abaixo de 0)
    player.stamina = -20;
    expect(player.stamina).toBe(0);
  });

  // Teste 3: Lançamento de erro para nome vazio (Exception Path)
  test("deve lançar erro ao tentar definir um nome vazio ou inválido", () => {
    // Arrange
    const player = new Player("Gabriel", Position.DEF, 40, 5000, 22, 4, 100);

    // Act & Assert
    expect(() => {
      player.name = "";
    }).toThrow("Nome não pode ser vazio.");

    expect(() => {
      player.name = "   ";
    }).toThrow("Nome não pode ser vazio.");
  });

  // Teste 4: Lançamento de erro para overall fora dos limites (Exception Path)
  test("deve lançar erro ao definir overall fora do intervalo de 1 a 100", () => {
    // Arrange
    const player = new Player("Gabriel", Position.DEF, 40, 5000, 22, 4, 100);

    // Act & Assert (Abaixo do limite)
    expect(() => {
      player.overall = 0;
    }).toThrow("Overall deve estar entre 1 e 100.");

    // Act & Assert (Acima do limite)
    expect(() => {
      player.overall = 101;
    }).toThrow("Overall deve estar entre 1 e 100.");
  });
});
