import { Player } from "./Player";
import { Position } from "./Position";

describe("Player Class (Domain Model)", () => {
  test("deve inicializar um jogador com valores personalizados corretamente", () => {
    const name = "Neymar Jr";
    const position = Position.ATA;
    const overall = 85;
    const transfer = 9000;
    const age = 30;
    const number = 10;
    const stamina = 95;

    const player = new Player(name, position, overall, transfer, age, number, stamina);

    expect(player.name).toBe(name);
    expect(player.position).toBe(position);
    expect(player.overall).toBe(overall);
    expect(player.transfer).toBe(transfer);
    expect(player.age).toBe(age);
    expect(player.number).toBe(number);
    expect(player.stamina).toBe(stamina);
  });

  test("deve limitar a stamina no intervalo [0, 100]", () => {
    const player = new Player("Gabriel", Position.DEF, 40, 5000, 22, 4, 100);

    player.stamina = 150;
    expect(player.stamina).toBe(100);

    player.stamina = -20;
    expect(player.stamina).toBe(0);
  });

  test("deve lançar erro ao tentar definir um nome vazio ou inválido", () => {
    const player = new Player("Gabriel", Position.DEF, 40, 5000, 22, 4, 100);

    expect(() => {
      player.name = "";
    }).toThrow("Nome não pode ser vazio.");

    expect(() => {
      player.name = "   ";
    }).toThrow("Nome não pode ser vazio.");
  });

  test("deve lançar erro ao definir overall fora do intervalo de 1 a 100", () => {
    const player = new Player("Gabriel", Position.DEF, 40, 5000, 22, 4, 100);

    expect(() => {
      player.overall = 0;
    }).toThrow("Overall deve estar entre 1 e 100.");

    expect(() => {
      player.overall = 101;
    }).toThrow("Overall deve estar entre 1 e 100.");
  });
});
