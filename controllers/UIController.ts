import * as readline from "readline";


export class UIController {
  
  private rl: readline.Interface;

  
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  
  async prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer: string) => {
        resolve(answer.trim());
      });
    });
  }

  
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

      
      await this.showMenuSelectionAnimation();

      return choice;
    }
  }

  
  print(message: string): void {
    console.log(message);
  }

  
  printTitle(title: string): void {
    console.log(`\n${"=".repeat(50)}`);
    console.log(title);
    console.log(`${"=".repeat(50)}`);
  }

  
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
        
        
        if (key === "\u0003") {
          clearInterval(interval);
          process.stdin.setRawMode!(isRaw);
          process.stdin.removeListener("data", onData);
          process.exit(0);
        }

        clearInterval(interval);
        process.stdin.setRawMode!(isRaw);
        process.stdin.removeListener("data", onData);
        
        
        process.stdout.write(`\r${" ".repeat(60)}\r`);
        resolve();
      };

      process.stdin.on("data", onData);
    });
  }

  
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

  
  clear(): void {
    console.clear();
  }

  
  close(): void {
    this.rl.close();
  }

  
  async showLoadingScreen(message: string, durationMs: number = 2000): Promise<void> {
    this.clear();
    const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    const intervalMs = 80;
    const totalSteps = Math.max(1, durationMs / intervalMs);

    for (let step = 0; step < totalSteps; step++) {
      const spinner = spinnerFrames[step % spinnerFrames.length];
      const percent = Math.round((step / totalSteps) * 100);
      
      
      const barLength = 20;
      const completedLength = Math.floor((percent / 100) * barLength);
      const remainingLength = Math.max(0, barLength - completedLength - 1);
      
      const progressBar = "█".repeat(completedLength) + ">" + "░".repeat(remainingLength);
      
      
      process.stdout.write(`\r${spinner}  ${message} - Carregando... [${progressBar}] ${percent}% `);
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    
    
    process.stdout.write(`\r  ${message} - Pronto! [${"█".repeat(20)}] 100%\n\n`);
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
}
