import { Util } from "../util/PlayersInfos";
import { Person } from "./Person";

export enum Position {
  GOL = "GOL",
  DEF = "DEF",
  MEI = "MEI",
  ATA = "ATA",
  COACH = "COACH"
}

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
      name ?? Util.getNome(),
      age ?? Util.getAge(),
      number ?? Util.getNumber(),
      overall ?? Util.getOverall(),
      transfer ?? Util.getTransfer(),
      position ?? Util.getPosition(),
      stamina ?? 100
    );
  }
}