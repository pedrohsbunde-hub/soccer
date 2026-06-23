import * as fs from "fs/promises";
import * as path from "path";
import { Team } from "../models/Team";
import { Player, Position } from "../models/Player";
import { Economia } from "../models/Economia";

interface SavedPlayer {
  name: string;
  position: Position;
  overall: number;
  transfer?: number;
  age?: number;
  number?: number;
  stamina?: number;
}

interface SavedTeam {
  name: string;
  players: SavedPlayer[];
  economia: {
    saldo: number;
  };
}

export interface SavedStanding {
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface SavedCampaign {
  coachName: string;
  season: number;
  round: number;
  selectedTeamName: string;
  fixtures: string[];
  standings: SavedStanding[];
  teams: SavedTeam[];
  savedAt: string;
}

const SAVE_FILE_PATH = path.resolve(__dirname, "..", "data", "savegame.json");

export class CampaignSaveService {
  static getSaveFilePath(): string {
    return SAVE_FILE_PATH;
  }

  static buildSavedTeams(teams: Team[]): SavedTeam[] {
    return teams.map((team) => ({
      name: team.name,
      players: team.players.map((player) => ({
        name: player.name,
        position: player.position,
        overall: player.overall,
        transfer: player.transfer,
        age: player.age,
        number: player.Number,
        stamina: player.stamina
      })),
      economia: {
        saldo: team.economia.saldo
      }
    }));
  }

  static async saveCampaign(data: SavedCampaign): Promise<void> {
    const directory = path.dirname(SAVE_FILE_PATH);
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(SAVE_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  }

  static async loadCampaign(): Promise<SavedCampaign | null> {
    try {
      const fileContent = await fs.readFile(SAVE_FILE_PATH, "utf-8");
      const parsed = JSON.parse(fileContent) as SavedCampaign;
      return parsed;
    } catch {
      return null;
    }
  }

  static applyTeamsSnapshot(savedTeams: SavedTeam[], targetTeams: Team[]): void {
    for (const savedTeam of savedTeams) {
      const target = targetTeams.find((team) => team.name === savedTeam.name);

      if (!target) {
        continue;
      }

      target.players = savedTeam.players.map((player) =>
        new Player(
          player.name,
          player.position,
          player.overall,
          player.transfer,
          player.age,
          player.number,
          player.stamina
        )
      );

      target.economia = new Economia(savedTeam.economia.saldo);
      target.recalculateOveralls();
    }
  }
}
