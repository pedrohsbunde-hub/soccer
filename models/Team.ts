import { Player } from "./Player";
import { Economy } from "./Economy";
import { Position } from "./Position";

export class Team {
  private _attackOverall: number = 0;
  private _defenseOverall: number = 0;

  constructor(
    private _name: string,
    private _players: Player[],
    private _economy: Economy
  ) {
    if (_name.trim().length === 0) {
      throw new Error("Nome do time não pode ser vazio.");
    }
    this.recalculateOveralls();
  }

  public get name(): string {
    return this._name;
  }

  public set name(value: string) {
    if (value.trim().length === 0) {
      throw new Error("Nome do time não pode ser vazio.");
    }
    this._name = value;
  }

  public get players(): Player[] {
    return this._players;
  }

  public set players(value: Player[]) {
    this._players = value;
    this.recalculateOveralls();
  }

  public get economy(): Economy {
    return this._economy;
  }

  public set economy(value: Economy) {
    this._economy = value;
  }

  public get attackOverall(): number {
    return this._attackOverall;
  }

  public get defenseOverall(): number {
    return this._defenseOverall;
  }

  public recalculateOveralls(): void {
    this._attackOverall = Math.round(this.calculateAttackSector());
    this._defenseOverall = Math.round(this.calculateDefenseSector());
  }

  private calculateAttackSector(): number {
    return this._players
      .filter((player) => player.position === Position.ATA || player.position === Position.MEI)
      .reduce((total, player) => total + player.overall, 0);
  }

  private calculateDefenseSector(): number {
    return this._players
      .filter((player) => player.position === Position.DEF || player.position === Position.GOL)
      .reduce((total, player) => total + player.overall, 0);
  }
}
