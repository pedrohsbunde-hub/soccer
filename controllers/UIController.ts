import * as readline from "readline";

/**
 * Controller utilitário de interface no terminal.
 * Centraliza leitura de entrada e impressão formatada.
 */
export class UIController {
  /** Instância de leitura/escrita do terminal. */
  private rl: readline.Interface;

  /** Inicializa a interface readline. */
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Exibe uma pergunta e retorna a resposta do usuário
   */
  async prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer: string) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Exibe um menu com opções e retorna a escolha
   */
  async menu(title: string, options: string[]): Promise<number> {
    console.log(`\n${"=".repeat(50)}`);
    console.log(title);
    console.log(`${"=".repeat(50)}`);

    options.forEach((option, index) => {
      console.log(`${index + 1}. ${option}`);
    });

    while (true) {
      const answer = await this.prompt("\nDigite sua escolha: ");
      const choice = parseInt(answer);

      if (isNaN(choice) || choice < 1 || choice > options.length) {
        console.log("Opção inválida! Tente novamente.");
        continue;
      }

      // Animação ao escolher uma opção do menu
      await this.showMenuSelectionAnimation();

      return choice;
    }
  }

  /**
   * Exibe um texto simples
   */
  print(message: string): void {
    console.log(message);
  }

  /**
   * Exibe um texto com formatação de título
   */
  printTitle(title: string): void {
    console.log(`\n${"=".repeat(50)}`);
    console.log(title);
    console.log(`${"=".repeat(50)}`);
  }

  /**
   * Pausa e aguarda que qualquer tecla seja pressionada, exibindo uma animação de bola girando.
   */
  async pause(): Promise<void> {
    const isTTY = process.stdin.isTTY;
    const canUseRaw = typeof process.stdin.setRawMode === "function";

    if (!isTTY || !canUseRaw) {
      await this.prompt("\nPressione Enter para continuar...");
      return;
    }

    return new Promise((resolve) => {
      const isRaw = process.stdin.isRaw;
      process.stdin.setRawMode!(true);
      process.stdin.resume();

      const spinnerFrames = [
        "⠋",
        "⠙",
        "⠹",
        "⠸",
        "⠼",
        "⠴",
        "⠦",
        "⠧",
        "⠇",
        "⠏"
      ];
      let frameIndex = 0;

      process.stdout.write("\n");

      const interval = setInterval(() => {
        const frame = spinnerFrames[frameIndex % spinnerFrames.length];
        process.stdout.write(`\r${frame}  Pressione qualquer tecla para continuar...`);
        frameIndex++;
      }, 100);

      const onData = (chunk: Buffer) => {
        const key = chunk.toString();
        
        // Captura Ctrl+C para encerrar o processo
        if (key === "\u0003") {
          clearInterval(interval);
          process.stdin.setRawMode!(isRaw);
          process.stdin.removeListener("data", onData);
          process.exit(0);
        }

        clearInterval(interval);
        process.stdin.setRawMode!(isRaw);
        process.stdin.removeListener("data", onData);
        
        // Limpa a linha atual
        process.stdout.write(`\r${" ".repeat(60)}\r`);
        resolve();
      };

      process.stdin.on("data", onData);
    });
  }

  /**
   * Mostra uma animação curta da bola de futebol ⚽ girando após uma seleção do menu.
   */
  async showMenuSelectionAnimation(durationMs: number = 800): Promise<void> {
    const spinnerFrames = [
      "⠋",
      "⠙",
      "⠹",
      "⠸",
      "⠼",
      "⠴",
      "⠦",
      "⠧",
      "⠇",
      "⠏"
    ];
    const intervalMs = 80;
    const totalSteps = Math.max(1, durationMs / intervalMs);
    
    for (let step = 0; step < totalSteps; step++) {
      const frame = spinnerFrames[step % spinnerFrames.length];
      process.stdout.write(`\r${frame}  Carregando escolha... `);
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    process.stdout.write(`\r${" ".repeat(40)}\r`);
  }

  /**
   * Mostra uma animação curta da bola de futebol ⚽ girando durante os lances da partida.
   */
  async showMatchEventAnimation(durationMs: number = 600): Promise<void> {
    const spinnerFrames = [
      "⠋",
      "⠙",
      "⠹",
      "⠸",
      "⠼",
      "⠴",
      "⠦",
      "⠧",
      "⠇",
      "⠏"
    ];
    const intervalMs = 60;
    const totalSteps = Math.max(1, durationMs / intervalMs);
    
    for (let step = 0; step < totalSteps; step++) {
      const frame = spinnerFrames[step % spinnerFrames.length];
      process.stdout.write(`\r${frame}  Simulando lance... `);
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    process.stdout.write(`\r${" ".repeat(40)}\r`);
  }

  /**
   * Limpa a tela (aproximado)
   */
  clear(): void {
    console.clear();
  }

  /**
   * Fecha a interface readline
   */
  close(): void {
    this.rl.close();
  }

  /**
   * Mostra uma tela de carregamento com a bola de futebol ⚽ rolando na barra e indicador "Carregando"
   */
  async showLoadingScreen(message: string, durationMs: number = 2000): Promise<void> {
    this.clear();
    const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    const intervalMs = 80;
    const totalSteps = Math.max(1, durationMs / intervalMs);

    for (let step = 0; step < totalSteps; step++) {
      const spinner = spinnerFrames[step % spinnerFrames.length];
      const percent = Math.round((step / totalSteps) * 100);
      
      // Barra de progresso com a bola ⚽ rolando/andando
      const barLength = 20;
      const completedLength = Math.floor((percent / 100) * barLength);
      const remainingLength = Math.max(0, barLength - completedLength - 1);
      
      const progressBar = "█".repeat(completedLength) + ">" + "░".repeat(remainingLength);
      
      // Exibe: spinner + mensagem + "Carregando" + barra animada + porcentagem
      process.stdout.write(`\r${spinner}  ${message} - Carregando... [${progressBar}] ${percent}% `);
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    
    // Conclusão com a bola no final
    process.stdout.write(`\r  ${message} - Pronto! [${"█".repeat(20)}] 100%\n\n`);
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
}
