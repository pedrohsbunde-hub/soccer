import { fakerPT_BR as faker } from '@faker-js/faker';

type PositionValue = "GOL" | "DEF" | "MEI" | "ATA";

export class PlayerGenerator {
  
  static generateName(): string {
    return faker.person.firstName('male') + ' ' + faker.person.lastName('male');
  }

  
  static generateAge(): number {
    return faker.number.int({ min: 18, max: 35 });
  }

  
  static generateNumber(): number {
    return faker.number.int({ min: 1, max: 99 });
  } 

  
  static generatePosition(): PositionValue {
    const positions: PositionValue[] = ["GOL", "DEF", "MEI", "ATA"];
    const index = faker.number.int({ min: 0, max: positions.length - 1 });
    return positions[index] ?? "GOL";
  }

  
  static generateOverall(): number {
    return faker.number.int({ min: 30, max: 40 });
  }

  
  static generateTransfer(): number {
    return faker.number.int({ min: 1000, max: 10000 });
  }
}
