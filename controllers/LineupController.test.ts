import { LineupController } from "./LineupController";
import { Team } from "../models/Team";
import { Player, Position } from "../models/Player";
import { Economia } from "../models/Economia";
import { UIController } from "./UIController";

describe("LineupController Class", () => {
  let lineupController: LineupController;
  let mockUi: jest.Mocked<UIController>;

  beforeEach(() => {
    lineupController = new LineupController();
    mockUi = {
      print: jest.fn(),
      printTitle: jest.fn(),
      prompt: jest.fn(),
      menu: jest.fn(),
      clear: jest.fn(),
      close: jest.fn(),
      pause: jest.fn(),
      showMenuSelectionAnimation: jest.fn(),
      showMatchEventAnimation: jest.fn(),
      showLoadingScreen: jest.fn(),
    } as unknown as jest.Mocked<UIController>;
  });

  function createMockTeam(name: string): Team {
    const players: Player[] = [];
    players.push(new Player(`${name} G1`, Position.GOL, 35, 5000, 25, 1, 100));
    players.push(new Player(`${name} G2`, Position.GOL, 35, 5000, 25, 2, 100));
    for (let i = 0; i < 5; i++) {
      players.push(new Player(`${name} D${i}`, Position.DEF, 35, 5000, 25, i + 3, 100));
    }
    for (let i = 0; i < 5; i++) {
      players.push(new Player(`${name} M${i}`, Position.MEI, 35, 5000, 25, i + 8, 100));
    }
    for (let i = 0; i < 5; i++) {
      players.push(new Player(`${name} A${i}`, Position.ATA, 35, 5000, 25, i + 13, 100));
    }

    return new Team(name, players, new Economia(10000));
  }

  test("deve escolher escalacao do NPC aleatoriamente com sucesso", () => {
    const team = createMockTeam("NPC Team");
    const lineup = lineupController.chooseNpcLineup(team);

    expect(lineup.team).toBe(team);
    expect(["4-2-2", "4-3-3", "4-2-4"]).toContain(lineup.formation);
    expect(lineup.starters.length).toBe(11);
    expect(lineup.attackOverall).toBeGreaterThan(0);
    expect(lineup.defenseOverall).toBeGreaterThan(0);

    const gols = lineup.starters.filter(p => p.position === Position.GOL);
    const defs = lineup.starters.filter(p => p.position === Position.DEF);
    expect(gols.length).toBe(1);
    expect(defs.length).toBe(4);
  });

  test("deve escolher escalacao do usuario com sucesso para a formacao 4-3-3", async () => {
    const team = createMockTeam("User Team");

    mockUi.menu.mockResolvedValue(2); 
    mockUi.prompt.mockResolvedValue("1");

    const lineup = await lineupController.chooseUserLineup(mockUi, team);

    expect(lineup.formation).toBe("4-3-3");
    expect(lineup.starters.length).toBe(11);
    
    const gols = lineup.starters.filter(p => p.position === Position.GOL);
    const defs = lineup.starters.filter(p => p.position === Position.DEF);
    const meis = lineup.starters.filter(p => p.position === Position.MEI);
    const atas = lineup.starters.filter(p => p.position === Position.ATA);

    expect(gols.length).toBe(1);
    expect(defs.length).toBe(4);
    expect(meis.length).toBe(3);
    expect(atas.length).toBe(3);
  });

  test("deve pedir novamente caso a escolha do jogador seja invalida", async () => {
    const team = createMockTeam("User Team");
    mockUi.menu.mockResolvedValue(1);

    let callCount = 0;
    mockUi.prompt.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) return "99";
      return "1";
    });

    const lineup = await lineupController.chooseUserLineup(mockUi, team);
    expect(lineup.starters.length).toBe(11);
    expect(mockUi.print).toHaveBeenCalledWith("Opção inválida. Tente novamente.");
  });

  test("deve estourar erro se nao houver jogadores suficientes na posicao", async () => {
    const players = [new Player("User D1", Position.DEF, 35, 5000, 25, 3, 100)];
    const brokenTeam = new Team("Broken Team", players, new Economia(10000));

    mockUi.menu.mockResolvedValue(1);

    await expect(lineupController.chooseUserLineup(mockUi, brokenTeam)).rejects.toThrow(
      "Sem jogadores suficientes para posição GOL."
    );
  });
});
