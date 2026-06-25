import { UIController } from "./UIController";
import * as readline from "readline";

jest.mock("readline");

describe("UIController", () => {
  let mockRl: any;
  let uiController: UIController;

  beforeEach(() => {
    mockRl = {
      question: jest.fn(),
      close: jest.fn(),
    };
    (readline.createInterface as jest.Mock).mockReturnValue(mockRl);
    uiController = new UIController();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("deve instanciar o readline interface", () => {
    expect(readline.createInterface).toHaveBeenCalled();
  });

  test("deve chamar prompt e retornar resposta limpa", async () => {
    mockRl.question.mockImplementation((query: string, cb: Function) => {
      cb("  resposta do usuario   ");
    });

    const response = await uiController.prompt("Qual seu nome? ");
    expect(response).toBe("resposta do usuario");
    expect(mockRl.question).toHaveBeenCalledWith("Qual seu nome? ", expect.any(Function));
  });

  test("deve rodar o menu e retornar a escolha valida", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const animSpy = jest.spyOn(uiController, "showMenuSelectionAnimation").mockResolvedValue(undefined);

    mockRl.question.mockImplementation((query: string, cb: Function) => {
      cb("2");
    });

    const choice = await uiController.menu("Titulo", ["Opcao A", "Opcao B"]);
    expect(choice).toBe(2);
    expect(logSpy).toHaveBeenCalled();
    expect(animSpy).toHaveBeenCalled();
  });

  test("deve repetir o menu se a escolha for invalida", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const animSpy = jest.spyOn(uiController, "showMenuSelectionAnimation").mockResolvedValue(undefined);

    let callCount = 0;
    mockRl.question.mockImplementation((query: string, cb: Function) => {
      if (callCount === 0) {
        callCount++;
        cb("99");
      } else {
        cb("1");
      }
    });

    const choice = await uiController.menu("Titulo", ["Opcao A", "Opcao B"]);
    expect(choice).toBe(1);
    expect(logSpy).toHaveBeenCalledWith("Opção inválida! Tente novamente.");
    expect(animSpy).toHaveBeenCalled();
  });

  test("deve printar mensagem comum", () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    uiController.print("Ola");
    expect(logSpy).toHaveBeenCalledWith("Ola");
  });

  test("deve printar titulo", () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    uiController.printTitle("Titulo");
    expect(logSpy).toHaveBeenCalled();
  });

  test("deve chamar clear", () => {
    const clearSpy = jest.spyOn(console, "clear").mockImplementation(() => {});
    uiController.clear();
    expect(clearSpy).toHaveBeenCalled();
  });

  test("deve chamar close no readline", () => {
    uiController.close();
    expect(mockRl.close).toHaveBeenCalled();
  });

  test("deve rodar showMenuSelectionAnimation", async () => {
    const writeSpy = jest.spyOn(process.stdout, "write").mockImplementation((() => true) as any);
    await uiController.showMenuSelectionAnimation(10);
    expect(writeSpy).toHaveBeenCalled();
  });

  test("deve rodar showMatchEventAnimation", async () => {
    const writeSpy = jest.spyOn(process.stdout, "write").mockImplementation((() => true) as any);
    await uiController.showMatchEventAnimation(10);
    expect(writeSpy).toHaveBeenCalled();
  });

  test("deve rodar showLoadingScreen", async () => {
    const writeSpy = jest.spyOn(process.stdout, "write").mockImplementation((() => true) as any);
    const clearSpy = jest.spyOn(console, "clear").mockImplementation(() => {});
    await uiController.showLoadingScreen("Carregando...", 10);
    expect(writeSpy).toHaveBeenCalled();
    expect(clearSpy).toHaveBeenCalled();
  });

  test("deve pausar com prompt caso stdin nao seja TTY", async () => {
    Object.defineProperty(process.stdin, "isTTY", {
      value: false,
      configurable: true
    });
    mockRl.question.mockImplementation((query: string, cb: Function) => cb(""));

    await uiController.pause();
    expect(mockRl.question).toHaveBeenCalledWith("\nPressione Enter para continuar...", expect.any(Function));
  });
});
