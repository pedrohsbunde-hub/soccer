import { fakerPT_BR as faker } from '@faker-js/faker';

type PositionValue = "GOL" | "DEF" | "MEI" | "ATA";

export class Util{

    // Nome do NPC
    static getNome(): string{
        return faker.person.firstName('male') + ' ' + faker.person.lastName('male');
    }

    // Idade do Jogador
    static getAge(): number{
        return faker.number.int({ min: 18, max: 35 });
    }

    // Número do Jogador
    static getNumber(): number{
        return faker.number.int({ min: 1, max: 99 });
    } 

    // Define Posição
    static getPosition(): PositionValue {
        const positions: PositionValue[] = ["GOL", "DEF", "MEI", "ATA"];
        const index = faker.number.int({ min: 0, max: positions.length - 1 });
        return positions[index] ?? "GOL";
    }

    static getOverall(): number {
        return faker.number.int({ min: 30, max: 40 });
    }

    static getTransfer(): number {
        return faker.number.int({ min: 1000, max: 10000 });
    }
}

