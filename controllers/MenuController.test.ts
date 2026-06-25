import { MenuController } from "./MenuController";
import { UIController } from "./UIController";
import { CampaignSaveService } from "../services/CampaignSaveService";

jest.mock("./UIController");
jest.mock("../services/CampaignSaveService");
jest.mock("./CampaignController", () => {
  return {
    CampaignController: jest.fn(),
  };
});

describe("MenuController", () => {
  let menuController: MenuController;
  let mockUi: jest.Mocked<UIController>;

  beforeEach(() => {
    const { CampaignController } = require("./CampaignController");
    CampaignController.mockImplementation(() => {
      return {
        start: jest.fn().mockResolvedValue(undefined),
        startFromSave: jest.fn().mockResolvedValue(undefined),
      };
    });

    menuController = new MenuController();
    mockUi = (menuController as any).ui;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("deve rodar instrucoes do jogo e depois sair", async () => {
    let menuCallCount = 0;
    mockUi.menu.mockImplementation(async () => {
      menuCallCount++;
      return menuCallCount === 1 ? 3 : 4;
    });

    await menuController.start();

    expect(mockUi.printTitle).toHaveBeenCalledWith("FOOTBALL MANAGER 2026");
    expect(mockUi.printTitle).toHaveBeenCalledWith("INSTRUÇÕES DO JOGO");
    expect(mockUi.pause).toHaveBeenCalledTimes(1);
    expect(mockUi.close).toHaveBeenCalledTimes(1);
  });

  test("deve iniciar nova campanha com sucesso", async () => {
    let menuCallCount = 0;
    mockUi.menu.mockImplementation(async () => {
      menuCallCount++;
      return menuCallCount === 1 ? 1 : 4;
    });

    mockUi.prompt.mockResolvedValue("Tecnico Teste");

    const { CampaignController } = require("./CampaignController");

    await menuController.start();

    expect(mockUi.prompt).toHaveBeenCalledWith("Digite o nome do seu técnico: ");
    expect(CampaignController).toHaveBeenCalledWith("Tecnico Teste", mockUi);
    const mockCampaignInstance = CampaignController.mock.results[0].value;
    expect(mockCampaignInstance.start).toHaveBeenCalled();
  });

  test("deve exibir erro se nome do tecnico for vazio na nova campanha", async () => {
    let menuCallCount = 0;
    mockUi.menu.mockImplementation(async () => {
      menuCallCount++;
      return menuCallCount === 1 ? 1 : 4;
    });

    mockUi.prompt.mockResolvedValue("");

    await menuController.start();

    expect(mockUi.print).toHaveBeenCalledWith("Nome inválido!");
    expect(mockUi.pause).toHaveBeenCalled();
  });

  test("deve exibir mensagem se nao houver campanha salva", async () => {
    let menuCallCount = 0;
    mockUi.menu.mockImplementation(async () => {
      menuCallCount++;
      return menuCallCount === 1 ? 2 : 4;
    });

    (CampaignSaveService.loadCampaign as jest.Mock).mockResolvedValue(null);

    await menuController.start();

    expect(mockUi.print).toHaveBeenCalledWith("Nenhuma campanha salva encontrada.");
    expect(mockUi.pause).toHaveBeenCalled();
  });

  test("deve carregar campanha salva com sucesso se confirmado pelo usuario", async () => {
    let menuCallCount = 0;
    mockUi.menu.mockImplementation(async (title: string, options?: string[]) => {
      if (title === "MENU PRINCIPAL") {
        menuCallCount++;
        return menuCallCount === 1 ? 2 : 4;
      }
      return 1;
    });

    const mockSaved = {
      coachName: "Saved Coach",
      season: 2,
      round: 5,
    };
    (CampaignSaveService.loadCampaign as jest.Mock).mockResolvedValue(mockSaved);

    const { CampaignController } = require("./CampaignController");

    await menuController.start();

    expect(CampaignController).toHaveBeenCalledWith("Saved Coach", mockUi);
    const mockCampaignInstance = CampaignController.mock.results[0].value;
    expect(mockCampaignInstance.startFromSave).toHaveBeenCalledWith(mockSaved);
  });

  test("deve cancelar o carregamento da campanha se usuario optar por cancelar", async () => {
    let menuCallCount = 0;
    mockUi.menu.mockImplementation(async (title: string, options?: string[]) => {
      if (title === "MENU PRINCIPAL") {
        menuCallCount++;
        return menuCallCount === 1 ? 2 : 4;
      }
      return 2;
    });

    const mockSaved = {
      coachName: "Saved Coach",
      season: 2,
      round: 5,
    };
    (CampaignSaveService.loadCampaign as jest.Mock).mockResolvedValue(mockSaved);

    const { CampaignController } = require("./CampaignController");

    await menuController.start();

    expect(CampaignController).not.toHaveBeenCalled();
  });
});
