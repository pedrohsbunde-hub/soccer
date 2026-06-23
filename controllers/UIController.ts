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
        console.log("❌ Opção inválida! Tente novamente.");
        continue;
      }

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
   * Pausa e aguarda Enter
   */
  async pause(): Promise<void> {
    await this.prompt("\nPressione Enter para continuar...");
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
      
      const progressBar = "█".repeat(completedLength) + "⚽" + "░".repeat(remainingLength);
      
      // Exibe: spinner + mensagem + "Carregando" + barra animada + porcentagem
      process.stdout.write(`\r${spinner}  ${message} - Carregando... [${progressBar}] ${percent}% `);
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    
    // Conclusão com a bola no final
    process.stdout.write(`\r⚽  ${message} - Pronto! [${"█".repeat(20)}⚽] 100%\n\n`);
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
}
