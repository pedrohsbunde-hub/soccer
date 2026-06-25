import { MatchController } from "./MatchController";
import { Team } from "../models/Team";
import { Player } from "../models/Player";
import { Position } from "../models/Position";
import { Economy } from "../models/Economy";
import { MatchLineup } from "./LineupController";

describe("MatchController Class (Game Engine)", () => {
  let matchController: MatchController;

  beforeEach(() => {
    matchController = new MatchController();
  });

  function createMockTeam(name: string, initialBalance: number = 100000): Team {
    const players: Player[] = [];
    
    for (let i = 0; i < 2; i++) {
      players.push(new Player(`${name} GOL ${i}`, Position.GOL, 35, 5000, 25, i + 1, 100));
    }
    
    for (let i = 0; i < 6; i++) {
      players.push(new Player(`${name} DEF ${i}`, Position.DEF, 35, 5000, 25, i + 3, 100));
    }
    
    for (let i = 0; i < 6; i++) {
      players.push(new Player(`${name} MEI ${i}`, Position.MEI, 35, 5000, 25, i + 9, 100));
    }
    
    for (let i = 0; i < 6; i++) {
      players.push(new Player(`${name} ATA ${i}`, Position.ATA, 35, 5000, 25, i + 15, 100));
    }

    return new Team(
      name,
      players,
      new Economy(initialBalance)
    );
  }

  function createMockLineup(team: Team): MatchLineup {
    
    const starters = [
      team.players[0], 
      team.players[2], team.players[3], team.players[4], team.players[5], 
      team.players[8], team.players[9], team.players[10], team.players[11], 
      team.players[14], team.players[15] 
    ];

    return {
      team,
      formation: "4-2-2",
      starters,
      attackOverall: starters
        .filter((p) => p.position === Position.ATA || p.position === Position.MEI)
        .reduce((sum, p) => sum + p.overall, 0),
      defenseOverall: starters
        .filter((p) => p.position === Position.DEF || p.position === Position.GOL)
        .reduce((sum, p) => sum + p.overall, 0)
    };
  }

  
  test("deve simular partida com 3 rodadas e alterar stamina dos titulares e reservas", () => {
    
    const teamA = createMockTeam("Team A");
    const teamB = createMockTeam("Team B");
    const lineupA = createMockLineup(teamA);
    const lineupB = createMockLineup(teamB);

    
    const result = matchController.simulateMatch(lineupA, lineupB);

    
    expect(result.turnEvents.length).toBe(3); 
    expect(result.homeGoals + result.awayGoals).toBeLessThanOrEqual(3);

    
    expect(teamA.players[0].stamina).toBe(85);
    
    expect(teamA.players[1].stamina).toBe(100);
  });

  
  test("deve aplicar treino pré-jogo aumentando overall e reduzindo stamina dos jogadores elegíveis", () => {
    
    const team = createMockTeam("Team A");
    const initialOverall = team.players[0].overall;

    
    const trainingResult = matchController.applyTraining(team);

    
    expect(trainingResult.invested).toBe(MatchController.TRAINING_COST);
    expect(trainingResult.averageIncreasePercent).toBeGreaterThan(0);
    expect(team.economy.balance).toBe(100000 - MatchController.TRAINING_COST);

    
    expect(team.players[0].stamina).toBe(85); 
    expect(team.players[0].overall).toBeGreaterThan(initialOverall);
  });

  
  test("deve retornar investimento zero e não alterar time se saldo for insuficiente", () => {
    
    const team = createMockTeam("Team A", 1000); 

    
    const trainingResult = matchController.applyTraining(team);

    
    expect(trainingResult.invested).toBe(0);
    expect(trainingResult.averageIncreasePercent).toBe(0);
    expect(team.economy.balance).toBe(1000);
    expect(team.players[0].stamina).toBe(100); 
  });

  
  test("não deve treinar jogador com stamina abaixo do mínimo necessário", () => {
    
    const team = createMockTeam("Team A");
    
    team.players[0].stamina = 10;
    const initialOverall = team.players[0].overall;

    
    matchController.applyTraining(team);

    
    expect(team.players[0].stamina).toBe(10); 
    expect(team.players[0].overall).toBe(initialOverall); 
  });
});
