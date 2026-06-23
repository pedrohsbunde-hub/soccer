import { Player, Position } from "../models/Player";
import { Util } from "../util/PlayersInfos";

export function generateTeamRoster(teamName: string): Player[] {
  const roster: Player[] = [];

  // 2 Goalkeepers (GOL)
  for (let i = 0; i < 2; i++) {
    roster.push(
      new Player(
        Util.getNome(),
        Position.GOL,
        Util.getOverall(),
        Util.getTransfer(),
        Util.getAge(),
        Util.getNumber(),
        100
      )
    );
  }

  // 6 Defenders (DEF)
  for (let i = 0; i < 6; i++) {
    roster.push(
      new Player(
        Util.getNome(),
        Position.DEF,
        Util.getOverall(),
        Util.getTransfer(),
        Util.getAge(),
        Util.getNumber(),
        100
      )
    );
  }

  // 6 Midfielders (MEI)
  for (let i = 0; i < 6; i++) {
    roster.push(
      new Player(
        Util.getNome(),
        Position.MEI,
        Util.getOverall(),
        Util.getTransfer(),
        Util.getAge(),
        Util.getNumber(),
        100
      )
    );
  }

  // 6 Attackers (ATA)
  for (let i = 0; i < 6; i++) {
    roster.push(
      new Player(
        Util.getNome(),
        Position.ATA,
        Util.getOverall(),
        Util.getTransfer(),
        Util.getAge(),
        Util.getNumber(),
        100
      )
    );
  }

  return roster;
}
