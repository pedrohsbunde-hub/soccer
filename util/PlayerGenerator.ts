import { fakerPT_BR as faker } from '@faker-js/faker';

type PositionValue = "GOL" | "DEF" | "MEI" | "ATA";

export class PlayerGenerator {
  // Gera nome do jogador
  static generateName(): string {
    return faker.person.firstName('male') + ' ' + faker.person.lastName('male');
  }

  // Gera idade do jogador
  static generateAge(): number {
    return faker.number.int({ min: 18, max: 35 });
  }

  // Gera número da camisa
  static generateNumber(): number {
    return faker.number.int({ min: 1, max: 99 });
  } 

  // Gera posição do jogador
  static generatePosition(): PositionValue {
    const positions: PositionValue[] = ["GOL", "DEF", "MEI", "ATA"];
    const index = faker.number.int({ min: 0, max: positions.length - 1 });
    return positions[index] ?? "GOL";
  }

  // Gera overall (habilidade média)
  static generateOverall(): number {
    return faker.number.int({ min: 30, max: 40 });
  }

  // Gera valor de transferência
  static generateTransfer(): number {
    return faker.number.int({ min: 1000, max: 10000 });
  }
}
