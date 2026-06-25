import { CampaignController } from "./CampaignController";
import { UIController } from "./UIController";
import { CampaignSaveService } from "../services/CampaignSaveService";
import { LineupController } from "./LineupController";
import { MatchController } from "./MatchController";
import { Team } from "../models/Team";
import { Player, Position } from "../models/Player";
import { Economia } from "../models/Economia";

jest.mock("./UIController");
jest.mock("../services/CampaignSaveService");
jest.mock("./LineupController");
jest.mock("./MatchController");

describe("CampaignController Class", () => {
  let campaignController: CampaignController;
  let mockUi: jest.Mocked<UIController>;
  let mockLineupController: jest.Mocked<LineupController>;
  let mockMatchController: jest.Mocked<MatchController>;

  function createMockTeam(name: string): Team {
    const players = [
      new Player(`${name} G1`, Position.GOL, 35, 5000, 25, 1, 100),
      new Player(`${name} A1`, Position.ATA, 35, 5000, 25, 2, 100),
    ];
    return new Team(name, players, new Economia(100000));
  }

  beforeEach(() => {
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

    mockLineupController = {
      chooseUserLineup: jest.fn(),
      chooseNpcLineup: jest.fn(),
    } as unknown as jest.Mocked<LineupController>;

    mockMatchController = {
      simulateMatch: jest.fn(),
      applyPostMatchEconomy: jest.fn(),
      applyOverallVariationByOutcome: jest.fn(),
      applyTraining: jest.fn(),
      getTrainingCost: jest.fn(),
    } as unknown as jest.Mocked<MatchController>;

    const { UIController: RealUIController } = require("./UIController");
    const { LineupController: RealLineupController } = require("./LineupController");
    const { MatchController: RealMatchController } = require("./MatchController");

    (RealUIController as jest.Mock).mockImplementation(() => mockUi);
    (RealLineupController as jest.Mock).mockImplementation(() => mockLineupController);
    (RealMatchController as jest.Mock).mockImplementation(() => mockMatchController);

    // Default return values for MatchController mock methods to avoid undefined exceptions
    mockMatchController.getTrainingCost.mockReturnValue(2000);
    mockMatchController.applyPostMatchEconomy.mockReturnValue(1000);
    mockMatchController.applyOverallVariationByOutcome.mockReturnValue(0);

    campaignController = new CampaignController("Coach Test", mockUi);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("deve tratar selecao de time invalida e abortar inicio de nova campanha", async () => {
    mockUi.prompt.mockResolvedValue("99");

    await campaignController.start();

    expect(mockUi.print).toHaveBeenCalledWith(" Opção inválida!");
    expect(mockUi.pause).toHaveBeenCalled();
  });

  test("deve iniciar nova campanha, exibir elenco, info e sair sem salvar", async () => {
    mockUi.prompt.mockResolvedValue("1");

    let menuCallCount = 0;
    mockUi.menu.mockImplementation(async (title: string, options?: string[]) => {
      if (title === "MENU CAMPANHA") {
        menuCallCount++;
        if (menuCallCount === 1) return 1; // Ver elenco
        if (menuCallCount === 2) return 4; // Informações do time
        return 5; // Salvar e Sair
      }
      if (title === "") {
        return 2; // Sair sem salvar
      }
      return 1;
    });

    await campaignController.start();

    expect(mockUi.showLoadingScreen).toHaveBeenCalledWith(
      expect.stringContaining("Inicializando campanha"),
      expect.any(Number)
    );
    expect(mockUi.printTitle).toHaveBeenCalledWith(expect.stringContaining("ELENCO"));
    expect(mockUi.printTitle).toHaveBeenCalledWith(expect.stringContaining("INFORMAÇÕES"));
    expect(mockUi.print).toHaveBeenCalledWith(expect.stringContaining("Saindo sem salvar"));
  });

  test("deve jogar partida, simular eventos e prosseguir rodada", async () => {
    mockUi.prompt.mockResolvedValue("1");

    let menuCallCount = 0;
    mockUi.menu.mockImplementation(async (title: string, options?: string[]) => {
      if (title === "MENU CAMPANHA") {
        menuCallCount++;
        return menuCallCount === 1 ? 2 : 5;
      }
      if (title === "TREINO PRÉ-PARTIDA") {
        return 2;
      }
      if (title === "") {
        return 2;
      }
      return 1;
    });

    const userTeam = createMockTeam("User Team");
    const npcTeam = createMockTeam("NPC Team");

    const userLineup = {
      team: userTeam,
      formation: "4-3-3" as any,
      starters: userTeam.players,
      attackOverall: 80,
      defenseOverall: 80,
    };
    const npcLineup = {
      team: npcTeam,
      formation: "4-4-2" as any,
      starters: npcTeam.players,
      attackOverall: 75,
      defenseOverall: 75,
    };

    mockLineupController.chooseUserLineup.mockResolvedValue(userLineup);
    mockLineupController.chooseNpcLineup.mockReturnValue(npcLineup);

    mockMatchController.simulateMatch.mockReturnValue({
      homeTeam: userTeam,
      awayTeam: npcTeam,
      homeLineup: userLineup,
      awayLineup: npcLineup,
      homeGoals: 2,
      awayGoals: 1,
      turnEvents: [{ turn: 1, attacker: "User Team", defender: "NPC Team", message: "Gol do time da casa!", attackingForce: 80, defendingForce: 70 }],
      homeOutcome: "WIN",
    });
    mockMatchController.applyPostMatchEconomy.mockReturnValue(2000);
    mockMatchController.applyOverallVariationByOutcome.mockReturnValue(1);

    await campaignController.start();

    expect(mockLineupController.chooseUserLineup).toHaveBeenCalled();
    expect(mockMatchController.simulateMatch).toHaveBeenCalled();
    expect(mockUi.print).toHaveBeenCalledWith(expect.stringContaining("Placar Final:"));
  });

  test("deve aceitar e aplicar treino pre-partida se usuario escolher treinar", async () => {
    mockUi.prompt.mockResolvedValue("1");

    let menuCallCount = 0;
    mockUi.menu.mockImplementation(async (title: string, options?: string[]) => {
      if (title === "MENU CAMPANHA") {
        menuCallCount++;
        return menuCallCount === 1 ? 2 : 5;
      }
      if (title === "TREINO PRÉ-PARTIDA") {
        return 1;
      }
      if (title === "") {
        return 2;
      }
      return 1;
    });

    const userTeam = createMockTeam("User Team");
    const npcTeam = createMockTeam("NPC Team");

    const userLineup = {
      team: userTeam,
      formation: "4-3-3" as any,
      starters: userTeam.players,
      attackOverall: 80,
      defenseOverall: 80,
    };
    const npcLineup = {
      team: npcTeam,
      formation: "4-4-2" as any,
      starters: npcTeam.players,
      attackOverall: 75,
      defenseOverall: 75,
    };

    mockLineupController.chooseUserLineup.mockResolvedValue(userLineup);
    mockLineupController.chooseNpcLineup.mockReturnValue(npcLineup);

    mockMatchController.getTrainingCost.mockReturnValue(2000);
    mockMatchController.applyTraining.mockReturnValue({
      invested: 2000,
      averageIncreasePercent: 1.5,
    });

    mockMatchController.simulateMatch.mockReturnValue({
      homeTeam: userTeam,
      awayTeam: npcTeam,
      homeLineup: userLineup,
      awayLineup: npcLineup,
      homeGoals: 0,
      awayGoals: 0,
      turnEvents: [],
      homeOutcome: "DRAW",
    });
    mockMatchController.applyPostMatchEconomy.mockReturnValue(1000);
    mockMatchController.applyOverallVariationByOutcome.mockReturnValue(0);

    await campaignController.start();

    expect(mockMatchController.applyTraining).toHaveBeenCalled();
    expect(mockUi.print).toHaveBeenCalledWith(expect.stringContaining("Treino concluído!"));
  });

  test("deve exibir erro se saldo for insuficiente para treino pre-jogo", async () => {
    mockUi.prompt.mockResolvedValue("1");

    let menuCallCount = 0;
    mockUi.menu.mockImplementation(async (title: string, options?: string[]) => {
      if (title === "MENU CAMPANHA") {
        menuCallCount++;
        return menuCallCount === 1 ? 2 : 5;
      }
      if (title === "TREINO PRÉ-PARTIDA") {
        return 1;
      }
      if (title === "") {
        return 2;
      }
      return 1;
    });

    const userTeam = createMockTeam("User Team");
    const npcTeam = createMockTeam("NPC Team");

    const userLineup = {
      team: userTeam,
      formation: "4-3-3" as any,
      starters: userTeam.players,
      attackOverall: 80,
      defenseOverall: 80,
    };
    const npcLineup = {
      team: npcTeam,
      formation: "4-4-2" as any,
      starters: npcTeam.players,
      attackOverall: 75,
      defenseOverall: 75,
    };

    mockLineupController.chooseUserLineup.mockResolvedValue(userLineup);
    mockLineupController.chooseNpcLineup.mockReturnValue(npcLineup);

    mockMatchController.getTrainingCost.mockReturnValue(2000);
    mockMatchController.applyTraining.mockReturnValue({
      invested: 0,
      averageIncreasePercent: 0,
    });

    mockMatchController.simulateMatch.mockReturnValue({
      homeTeam: userTeam,
      awayTeam: npcTeam,
      homeLineup: userLineup,
      awayLineup: npcLineup,
      homeGoals: 0,
      awayGoals: 0,
      turnEvents: [],
      homeOutcome: "DRAW",
    });

    await campaignController.start();

    expect(mockUi.print).toHaveBeenCalledWith(expect.stringContaining("Saldo insuficiente"));
  });

  test("deve salvar progresso no disco quando o usuario optar por salvar e sair", async () => {
    mockUi.prompt.mockResolvedValue("1");

    let menuCallCount = 0;
    mockUi.menu.mockImplementation(async (title: string, options?: string[]) => {
      if (title === "MENU CAMPANHA") {
        menuCallCount++;
        return 5;
      }
      if (title === "") {
        return 1; // Salvar progresso
      }
      return 1;
    });

    (CampaignSaveService.saveCampaign as jest.Mock).mockResolvedValue(undefined);
    (CampaignSaveService.getSaveFilePath as jest.Mock).mockReturnValue("cinho/save.json");

    await campaignController.start();

    expect(CampaignSaveService.saveCampaign).toHaveBeenCalled();
    expect(mockUi.print).toHaveBeenCalledWith(expect.stringContaining("Campanha salva em: cinho/save.json"));
  });

  test("deve iniciar campanha a partir de save reidratando estado", async () => {
    mockUi.menu.mockImplementation(async (title: string, options?: string[]) => {
      if (title === "MENU CAMPANHA") {
        return 5;
      }
      if (title === "") {
        return 2;
      }
      return 1;
    });

    const mockSaved = {
      coachName: "Saved Coach",
      season: 2,
      round: 4,
      selectedTeamName: "Corinthians",
      fixtures: ["Palmeiras"],
      standings: [
        {
          teamName: "Corinthians",
          played: 3,
          wins: 2,
          draws: 1,
          losses: 0,
          goalsFor: 5,
          goalsAgainst: 2,
          points: 7,
        },
        {
          teamName: "Palmeiras",
          played: 3,
          wins: 1,
          draws: 1,
          losses: 1,
          goalsFor: 3,
          goalsAgainst: 3,
          points: 4,
        }
      ],
      teams: [],
      savedAt: new Date().toISOString(),
    };

    await campaignController.startFromSave(mockSaved as any);

    expect(CampaignSaveService.applyTeamsSnapshot).toHaveBeenCalled();
    expect(mockUi.showLoadingScreen).toHaveBeenCalledWith(
      expect.stringContaining("Carregando campanha"),
      expect.any(Number)
    );
  });
});
