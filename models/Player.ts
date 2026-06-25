import { PlayerGenerator } from "../util/PlayerGenerator";
import { Person } from "./Person";
import { Position } from "./Position";

export class Player extends Person {
  constructor(
    name?: string,
    position?: Position | string,
    overall?: number,
    transfer?: number,
    age?: number,
    number?: number,
    stamina?: number
  ) {
    super(
      name ?? PlayerGenerator.generateName(),
      age ?? PlayerGenerator.generateAge(),
      number ?? PlayerGenerator.generateNumber(),
      overall ?? PlayerGenerator.generateOverall(),
      transfer ?? PlayerGenerator.generateTransfer(),
      position ?? PlayerGenerator.generatePosition(),
      stamina ?? 100
    );
  }
}