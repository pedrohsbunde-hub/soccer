import { Team } from "../models/Team";
import { MatchLineup } from "./LineupController";

export type MatchOutcome = "WIN" | "DRAW" | "LOSS";

export interface TurnEvent {
  turn: number;
  attacker: string;
  defender: string;
  attackingForce: number;
  defendingForce: number;
  message: string;
}

export interface MatchResult {
  homeTeam: Team;
  awayTeam: Team;
  homeLineup: MatchLineup;
  awayLineup: MatchLineup;
  homeGoals: number;
  awayGoals: number;
  turnEvents: TurnEvent[];
  homeOutcome: MatchOutcome;
}

export class MatchController {
  // Constantes de Jogo (Sem números mágicos)
  public static readonly STAMINA_LOSS_PER_MATCH = 15;
  public static readonly STAMINA_RECOVERY_PER_MATCH = 20;
  public static readonly STAMINA_LOSS_PER_TRAINING = 15;
  public static readonly MIN_STAMINA_FOR_TRAINING = 15;
  public static readonly TRAINING_COST = 2000;
  public static readonly WIN_BONUS = 10000;
  public static readonly DRAW_BONUS = 4000;
  public static readonly LOSS_BONUS = 1500;
  public static readonly MAX_LUCK_MULTIPLIER = 20;

  public simulateMatch(homeLineup: MatchLineup, awayLineup: MatchLineup): MatchResult {
    let homeGoals = 0;
    let awayGoals = 0;
    const turnEvents: TurnEvent[] = [];

    const homeAvgOverall = this.calculateAverageOverall(homeLineup.starters);
    const homeAvgStamina = this.calculateAverageStamina(homeLineup.starters);
    const awayAvgOverall = this.calculateAverageOverall(awayLineup.starters);
    const awayAvgStamina = this.calculateAverageStamina(awayLineup.starters);

    for (let turn = 1; turn <= 3; turn++) {
      const pointResult = this.simulateSetPoint(
        homeAvgOverall,
        homeAvgStamina,
        awayAvgOverall,
        awayAvgStamina,
        turn,
        homeLineup.team.name,
        awayLineup.team.name
      );

      homeGoals += pointResult.homeGoal;
      awayGoals += pointResult.awayGoal;
      turnEvents.push(pointResult.event);
    }

    this.applyMatchStamina(homeLineup);
    this.applyMatchStamina(awayLineup);

    const homeOutcome = this.determineOutcome(homeGoals, awayGoals);

    return {
      homeTeam: homeLineup.team,
      awayTeam: awayLineup.team,
      homeLineup,
      awayLineup,
      homeGoals,
      awayGoals,
      turnEvents,
      homeOutcome
    };
  }

  private calculateAverageOverall(players: any[]): number {
    return players.reduce((sum, p) => sum + p.overall, 0) / players.length;
  }

  private calculateAverageStamina(players: any[]): number {
    return players.reduce((sum, p) => sum + p.stamina, 0) / players.length;
  }

  private simulateSetPoint(
    homeAvgOverall: number,
    homeAvgStamina: number,
    awayAvgOverall: number,
    awayAvgStamina: number,
    turn: number,
    homeName: string,
    awayName: string
  ): { homeGoal: number; awayGoal: number; event: TurnEvent } {
    const homeLuck = Math.random() * MatchController.MAX_LUCK_MULTIPLIER;
    const awayLuck = Math.random() * MatchController.MAX_LUCK_MULTIPLIER;

    const homeRound = Math.round(homeAvgOverall + homeAvgStamina + homeLuck);
    const awayRound = Math.round(awayAvgOverall + awayAvgStamina + awayLuck);

    let homeGoal = 0;
    let awayGoal = 0;
    let message = `🤝 Set point empatado! Sem gols.`;

    if (homeRound > awayRound) {
      homeGoal = 1;
      message = `⚽ Gol do ${homeName}!`;
    } else if (awayRound > homeRound) {
      awayGoal = 1;
      message = `⚽ Gol do ${awayName}!`;
    }

    const event: TurnEvent = {
      turn,
      attacker: homeRound > awayRound ? homeName : awayName,
      defender: homeRound > awayRound ? awayName : homeName,
      attackingForce: Math.max(homeRound, awayRound),
      defendingForce: Math.min(homeRound, awayRound),
      message
    };

    return { homeGoal, awayGoal, event };
  }

  private applyMatchStamina(lineup: MatchLineup): void {
    for (const player of lineup.team.players) {
      if (lineup.starters.includes(player)) {
        player.stamina -= MatchController.STAMINA_LOSS_PER_MATCH;
      } else {
        player.stamina += MatchController.STAMINA_RECOVERY_PER_MATCH;
      }
    }
    lineup.team.recalculateOveralls();
  }

  private determineOutcome(homeGoals: number, awayGoals: number): MatchOutcome {
    if (homeGoals > awayGoals) return "WIN";
    if (homeGoals < awayGoals) return "LOSS";
    return "DRAW";
  }

  public getResultBonus(outcome: MatchOutcome): number {
    if (outcome === "WIN") return MatchController.WIN_BONUS;
    if (outcome === "DRAW") return MatchController.DRAW_BONUS;
    return MatchController.LOSS_BONUS;
  }

  public getTrainingCost(team: Team): number {
    return MatchController.TRAINING_COST;
  }

  public applyTraining(team: Team): { invested: number; averageIncreasePercent: number } {
    const cost = this.getTrainingCost(team);

    // CQS: Verificar saldo antes de debitar
    if (team.economia.saldo < cost) {
      return { invested: 0, averageIncreasePercent: 0 };
    }

    team.economia.debitar(cost);

    let totalIncrease = 0;
    let trainedCount = 0;

    for (const player of team.players) {
      if (player.stamina >= MatchController.MIN_STAMINA_FOR_TRAINING) {
        player.stamina -= MatchController.STAMINA_LOSS_PER_TRAINING;
        const increase = Math.floor(Math.random() * 3) + 1;
        player.overall += increase;
        totalIncrease += increase;
        trainedCount++;
      }
    }

    team.recalculateOveralls();

    return {
      invested: cost,
      averageIncreasePercent: trainedCount > 0 ? (totalIncrease / trainedCount) : 0
    };
  }

  public applyPostMatchEconomy(homeTeam: Team, outcome: MatchOutcome): number {
    const bonus = this.getResultBonus(outcome);
    homeTeam.economia.creditar(bonus);
    return bonus;
  }

  public applyOverallVariationByOutcome(team: Team, outcome: MatchOutcome): number {
    return 0;
  }
}
