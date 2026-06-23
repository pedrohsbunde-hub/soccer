import { MatchController } from "./MatchController";
import { Team } from "../models/Team";
import { Player, Position } from "../models/Player";
import { Economia } from "../models/Economia";
import { MatchLineup } from "./LineupController";

describe("MatchController Class (Game Engine)", () => {
  let matchController: MatchController;

  beforeEach(() => {
    matchController = new MatchController();
  });

  function createMockTeam(name: string, initialBalance: number = 100000): Team {
    const players: Player[] = [];
    // GOL
    for (let i = 0; i < 2; i++) {
      players.push(new Player(`${name} GOL ${i}`, Position.GOL, 35, 5000, 25, i + 1, 100));
    }
    // DEF
    for (let i = 0; i < 6; i++) {
      players.push(new Player(`${name} DEF ${i}`, Position.DEF, 35, 5000, 25, i + 3, 100));
    }
    // MEI
    for (let i = 0; i < 6; i++) {
      players.push(new Player(`${name} MEI ${i}`, Position.MEI, 35, 5000, 25, i + 9, 100));
    }
    // ATA
    for (let i = 0; i < 6; i++) {
      players.push(new Player(`${name} ATA ${i}`, Position.ATA, 35, 5000, 25, i + 15, 100));
    }

    return new Team(
      name,
      players,
      new Economia(initialBalance)
    );
  }

  function createMockLineup(team: Team): MatchLineup {
    // Selecionar 11 titulares: 1 GOL, 4 DEF, 4 MEI, 2 ATA
    const starters = [
      team.players[0], // GOL
      team.players[2], team.players[3], team.players[4], team.players[5], // DEF
      team.players[8], team.players[9], team.players[10], team.players[11], // MEI
      team.players[14], team.players[15] // ATA
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

  // Teste 1: Simulação completa e stamina (Happy Path)
  test("deve simular partida com 3 rodadas e alterar stamina dos titulares e reservas", () => {
    // Arrange
    const teamA = createMockTeam("Team A");
    const teamB = createMockTeam("Team B");
    const lineupA = createMockLineup(teamA);
    const lineupB = createMockLineup(teamB);

    // Act
    const result = matchController.simulateMatch(lineupA, lineupB);

    // Assert
    expect(result.turnEvents.length).toBe(3); // 3 set points
    expect(result.homeGoals + result.awayGoals).toBeLessThanOrEqual(3);

    // Titular (Gabriel GOL 0) deve perder 15 de stamina
    expect(teamA.players[0].stamina).toBe(85);
    // Reserva (Gabriel GOL 1) deve recuperar 20 de stamina (clampado em 100)
    expect(teamA.players[1].stamina).toBe(100);
  });

  // Teste 2: Treino pré-jogo com sucesso (Happy Path)
  test("deve aplicar treino pré-jogo aumentando overall e reduzindo stamina dos jogadores elegíveis", () => {
    // Arrange
    const team = createMockTeam("Team A");
    const initialOverall = team.players[0].overall;

    // Act
    const trainingResult = matchController.applyTraining(team);

    // Assert
    expect(trainingResult.invested).toBe(MatchController.TRAINING_COST);
    expect(trainingResult.averageIncreasePercent).toBeGreaterThan(0);
    expect(team.economia.saldo).toBe(100000 - MatchController.TRAINING_COST);

    // Jogadores treinados devem ter perdido stamina
    expect(team.players[0].stamina).toBe(85); // 100 - 15
    expect(team.players[0].overall).toBeGreaterThan(initialOverall);
  });

  // Teste 3: Falha no treino por falta de fundos (Exception/CQS Path)
  test("deve retornar investimento zero e não alterar time se saldo for insuficiente", () => {
    // Arrange
    const team = createMockTeam("Team A", 1000); // R$ 1.000 é menor que R$ 2.000 de custo

    // Act
    const trainingResult = matchController.applyTraining(team);

    // Assert
    expect(trainingResult.invested).toBe(0);
    expect(trainingResult.averageIncreasePercent).toBe(0);
    expect(team.economia.saldo).toBe(1000);
    expect(team.players[0].stamina).toBe(100); // Nenhuma stamina alterada
  });

  // Teste 4: Impedir treino de jogador com stamina muito baixa (Business Rules Path)
  test("não deve treinar jogador com stamina abaixo do mínimo necessário", () => {
    // Arrange
    const team = createMockTeam("Team A");
    // Definir stamina de um jogador para abaixo do mínimo (10)
    team.players[0].stamina = 10;
    const initialOverall = team.players[0].overall;

    // Act
    matchController.applyTraining(team);

    // Assert
    expect(team.players[0].stamina).toBe(10); // Permanece em 10
    expect(team.players[0].overall).toBe(initialOverall); // Não evolui
  });
});
