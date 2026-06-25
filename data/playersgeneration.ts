import { Player } from "../models/Player";
import { Position } from "../models/Position";
import { PlayerGenerator } from "../util/PlayerInfos";

export function generateTeamRoster(teamName: string): Player[] {
  const roster: Player[] = [];

  
  for (let i = 0; i < 2; i++) {
    roster.push(
      new Player(
        PlayerGenerator.generateName(),
        Position.GOL,
        PlayerGenerator.generateOverall(),
        PlayerGenerator.generateTransfer(),
        PlayerGenerator.generateAge(),
        PlayerGenerator.generateNumber(),
        100
      )
    );
  }

  
  for (let i = 0; i < 6; i++) {
    roster.push(
      new Player(
        PlayerGenerator.generateName(),
        Position.DEF,
        PlayerGenerator.generateOverall(),
        PlayerGenerator.generateTransfer(),
        PlayerGenerator.generateAge(),
        PlayerGenerator.generateNumber(),
        100
      )
    );
  }

  
  for (let i = 0; i < 6; i++) {
    roster.push(
      new Player(
        PlayerGenerator.generateName(),
        Position.MEI,
        PlayerGenerator.generateOverall(),
        PlayerGenerator.generateTransfer(),
        PlayerGenerator.generateAge(),
        PlayerGenerator.generateNumber(),
        100
      )
    );
  }

  
  for (let i = 0; i < 6; i++) {
    roster.push(
      new Player(
        PlayerGenerator.generateName(),
        Position.ATA,
        PlayerGenerator.generateOverall(),
        PlayerGenerator.generateTransfer(),
        PlayerGenerator.generateAge(),
        PlayerGenerator.generateNumber(),
        100
      )
    );
  }

  return roster;
}
