import { UIController } from "./UIController";
import { teams } from "../data/teamsgenerators";
import { Team } from "../models/Team";
import { MatchController, MatchResult } from "./MatchController";
import { CampaignSaveService, SavedCampaign } from "../services/CampaignSaveService";
import { LineupController } from "./LineupController";


interface TeamStanding {
  team: Team;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}


export class CampaignController {
  
  private ui: UIController;
  private matchController: MatchController;
  private lineupController: LineupController;
  private coachName: string;
  private selectedTeam: Team | null = null;
  private season: number = 1;
  private round: number = 1;
  private fixtures: Team[] = [];
  private standings: Map<string, TeamStanding> = new Map();

  
  constructor(coachName: string, ui?: UIController) {
    this.ui = ui ?? new UIController();
    this.matchController = new MatchController();
    this.lineupController = new LineupController();
    this.coachName = coachName;
  }

  
  async start(): Promise<void> {
    this.ui.clear();
    this.ui.printTitle("SELEÇÃO DE TIME");

    this.ui.print("Escolha seu time para a campanha:\n");

    teams.forEach((team, index) => {
      const teamOverall = Math.round((team.attackOverall + team.defenseOverall) / team.players.length);
      const saldoEmMil = (team.economy.balance / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
      this.ui.print(
        `${index + 1}. ${team.name} | Saldo: R$ ${saldoEmMil} | Overall: ${teamOverall}`
      );
    });

    const choice = await this.ui.prompt("\nDigite o número do time: ");
    const teamIndex = parseInt(choice) - 1;

    if (isNaN(teamIndex) || teamIndex < 0 || teamIndex >= teams.length) {
      this.ui.print(" Opção inválida!");
      await this.ui.pause();
      return;
    }

    this.selectedTeam = teams[teamIndex]!;
    this.initializeChampionship();
    await this.ui.showLoadingScreen(`Inicializando campanha com o time ${this.selectedTeam.name}...`, 1500);
    await this.gameLoop();
  }

  
  async startFromSave(savedCampaign: SavedCampaign): Promise<void> {
    CampaignSaveService.applyTeamsSnapshot(savedCampaign.teams, teams);

    this.coachName = savedCampaign.coachName;
    this.season = savedCampaign.season;
    this.round = savedCampaign.round;

    const selectedTeam = teams.find((team) => team.name === savedCampaign.selectedTeamName);

    if (!selectedTeam) {
      this.ui.print("Save inválido: time do usuário não encontrado.");
      await this.ui.pause();
      return;
    }

    this.selectedTeam = selectedTeam;
    this.fixtures = savedCampaign.fixtures
      .map((name) => teams.find((team) => team.name === name))
      .filter((team): team is Team => team !== undefined);

    this.standings.clear();

    for (const standing of savedCampaign.standings) {
      const team = teams.find((currentTeam) => currentTeam.name === standing.teamName);

      if (!team) {
        continue;
      }

      this.standings.set(team.name, {
        team,
        played: standing.played,
        wins: standing.wins,
        draws: standing.draws,
        losses: standing.losses,
        goalsFor: standing.goalsFor,
        goalsAgainst: standing.goalsAgainst,
        points: standing.points
      });
    }

    if (this.standings.size === 0 || this.fixtures.length === 0) {
      this.initializeChampionship();
    }

    await this.ui.showLoadingScreen("Carregando campanha salva do disco...", 1500);
    await this.gameLoop();
  }

  
  private async gameLoop(): Promise<void> {
    let running = true;

    while (running) {
      this.ui.clear();
      this.displayStatus();

      const choice = await this.ui.menu(
        "MENU CAMPANHA",
        [
          "Ver Elenco",
          "Jogar Partida",
          "Mercado de Transferências",
          "Informações do Time",
          "Salvar e Sair"
        ]
      );

      switch (choice) {
        case 1:
          await this.showSquad();
          break;
        case 2:
          await this.playMatch();
          break;
        case 3:
          await this.transferMarket();
          break;
        case 4:
          await this.teamInfo();
          break;
        case 5:
          running = false;
          await this.saveAndExit();
          break;
      }
    }
  }

  
  private displayStatus(): void {
    if (!this.selectedTeam) return;

    this.ui.printTitle(`${this.selectedTeam.name} - Temporada ${this.season} | Rodada ${this.round}`);
    this.ui.print(`Técnico: ${this.coachName}`);
    this.ui.print(`Saldo: R$ ${this.selectedTeam.economy.balance.toLocaleString("pt-BR")}`);
    this.ui.print(`Ataque: ${this.selectedTeam.attackOverall} | Defesa: ${this.selectedTeam.defenseOverall}`);

    const userStanding = this.standings.get(this.selectedTeam.name);
    const currentPosition = this.getSortedStandings().findIndex((entry) => entry.team.name === this.selectedTeam?.name) + 1;

    if (userStanding) {
      this.ui.print(`Classificação: ${currentPosition}º | Pts: ${userStanding.points} | J: ${userStanding.played} | V: ${userStanding.wins} E: ${userStanding.draws} D: ${userStanding.losses}`);
    }
  }

  
  private async showSquad(): Promise<void> {
    this.ui.clear();

    if (!this.selectedTeam) return;

    this.ui.printTitle(`ELENCO - ${this.selectedTeam.name}`);
    this.ui.print(`Total de Jogadores: ${this.selectedTeam.players.length}\n`);

    const positions = ["GOL", "DEF", "MEI", "ATA"];

    for (const pos of positions) {
      const positionPlayers = this.selectedTeam.players.filter(p => p.position === pos);

      if (positionPlayers.length > 0) {
        this.ui.print(`\n${pos}:`);
        positionPlayers.forEach((player, idx) => {
          this.ui.print(
            `  ${idx + 1}. ${player.name} (Overall: ${player.overall} | Stamina: ${player.stamina}%) - Valor: R$ ${player.transfer.toLocaleString("pt-BR")}`
          );
        });
      }
    }

    await this.ui.pause();
  }

  
  private async playMatch(): Promise<void> {
    if (!this.selectedTeam) return;

    if (this.round > this.fixtures.length) {
      await this.finishSeason();
      return;
    }

    const opponent = this.fixtures[this.round - 1]!;

    this.ui.clear();
    this.ui.printTitle("JOGAR PARTIDA");
    this.ui.print(`Rodada ${this.round} - ${this.selectedTeam.name} x ${opponent.name}`);

    await this.offerPreMatchTraining();

    const userLineup = await this.lineupController.chooseUserLineup(this.ui, this.selectedTeam);
    const opponentLineup = this.lineupController.chooseNpcLineup(opponent);

    this.ui.print("\nEscalações confirmadas:");
    this.ui.print(
      `${userLineup.team.name} (${userLineup.formation}) | ATA: ${userLineup.attackOverall} | DEF: ${userLineup.defenseOverall}`
    );
    this.ui.print(
      `${opponentLineup.team.name} (${opponentLineup.formation}) | ATA: ${opponentLineup.attackOverall} | DEF: ${opponentLineup.defenseOverall}`
    );

    await this.ui.showLoadingScreen(`Simulando partida contra ${opponent.name}...`, 2000);
    const result = this.matchController.simulateMatch(userLineup, opponentLineup);
    const homeIncome = this.matchController.applyPostMatchEconomy(this.selectedTeam, result.homeOutcome);
    const variation = this.matchController.applyOverallVariationByOutcome(this.selectedTeam, result.homeOutcome);

    this.registerMatchResult(result.homeTeam, result.awayTeam, result.homeGoals, result.awayGoals);
    this.playOtherMatchesOfRound(opponent);

    this.ui.print("\nResumo da Partida:");

    for (const event of result.turnEvents) {
      await this.ui.showMatchEventAnimation(700);
      this.ui.print(
        `Etapa ${event.turn}: ${event.message} (${event.attackingForce} x ${event.defendingForce})`
      );
    }

    this.ui.print(`\nPlacar Final: ${result.homeTeam.name} ${result.homeGoals} x ${result.awayGoals} ${result.awayTeam.name}`);
    this.ui.print(`Bônus de partida: R$ ${homeIncome.toLocaleString("pt-BR")}`);
    if (variation !== 0) {
      this.ui.print(`Variação de overall do seu elenco: ${variation.toFixed(0)}%`);
    }

    const userStanding = this.standings.get(this.selectedTeam.name);

    if (userStanding) {
      this.ui.print(`Campanha: ${userStanding.points} pontos em ${userStanding.played} jogos`);
    }

    this.round += 1;

    if (this.round > this.fixtures.length) {
      this.ui.print("\nVocê completou todas as rodadas desta temporada!");
    }

    await this.ui.pause();
  }

  
  private async transferMarket(): Promise<void> {
    this.ui.clear();
    this.ui.printTitle("MERCADO DE TRANSFERÊNCIAS");
    this.ui.print("Funcionalidade em desenvolvimento...\n");
    this.ui.print("Aqui você poderá comprar e vender jogadores.\n");
    await this.ui.pause();
  }

  
  private async teamInfo(): Promise<void> {
    this.ui.clear();

    if (!this.selectedTeam) return;

    this.ui.printTitle(`INFORMAÇÕES - ${this.selectedTeam.name}`);

    this.ui.print(`\nECONOMIA:`);
    this.ui.print(`   Saldo: R$ ${this.selectedTeam.economy.balance.toLocaleString("pt-BR")}`);

    this.ui.print(`\nELENCO:`);
    this.ui.print(`   Total de Jogadores: ${this.selectedTeam.players.length}`);
    this.ui.print(`   Overall de Ataque: ${this.selectedTeam.attackOverall}`);
    this.ui.print(`   Overall de Defesa: ${this.selectedTeam.defenseOverall}`);
    const overallMedio = (
      this.selectedTeam.players.reduce((sum, p) => sum + p.overall, 0) /
      this.selectedTeam.players.length
    ).toFixed(1);
    const staminaMedio = (
      this.selectedTeam.players.reduce((sum, p) => sum + p.stamina, 0) /
      this.selectedTeam.players.length
    ).toFixed(1);
    this.ui.print(`   Overall Médio: ${overallMedio}`);
    this.ui.print(`   Stamina Média: ${staminaMedio}%`);

    this.ui.print("\nTABELA DO CAMPEONATO (TOP 5):");
    const topFive = this.getSortedStandings().slice(0, 5);
    topFive.forEach((standing, index) => {
      this.ui.print(
        `   ${index + 1}º ${standing.team.name} - ${standing.points} pts (V${standing.wins}/E${standing.draws}/D${standing.losses})`
      );
    });

    await this.ui.pause();
  }

  
  private initializeChampionship(): void {
    if (!this.selectedTeam) return;

    this.round = 1;
    this.fixtures = teams.filter((team) => team.name !== this.selectedTeam?.name);
    this.standings.clear();

    for (const team of teams) {
      team.recalculateOveralls();

      this.standings.set(team.name, {
        team,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0
      });
    }
  }

  
  private async offerPreMatchTraining(): Promise<void> {
    if (!this.selectedTeam) return;

    const trainingCost = this.matchController.getTrainingCost(this.selectedTeam);
    const choice = await this.ui.menu(
      "TREINO PRÉ-PARTIDA",
      [
        `Treinar elenco inteiro (Custo: R$ ${trainingCost.toLocaleString("pt-BR")})`,
        "Pular treino"
      ]
    );

    if (choice !== 1) {
      this.ui.print("Você optou por não treinar antes da partida.");
      return;
    }

    await this.ui.showLoadingScreen("Realizando treino físico e tático...", 1500);
    const trainingResult = this.matchController.applyTraining(this.selectedTeam);

    if (trainingResult.invested === 0) {
      this.ui.print("Saldo insuficiente para treinar o elenco.");
      return;
    }

    this.ui.print(
      `Treino concluído! Investimento: R$ ${trainingResult.invested.toLocaleString("pt-BR")} | Ganho médio: +${trainingResult.averageIncreasePercent.toFixed(1)} de overall`
    );
  }

  
  private playOtherMatchesOfRound(userOpponent: Team): void {
    if (!this.selectedTeam) return;

    const roundTeams = teams.filter(
      (team) => team.name !== this.selectedTeam?.name && team.name !== userOpponent.name
    );

    for (let i = roundTeams.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      const current = roundTeams[i]!;
      roundTeams[i] = roundTeams[randomIndex]!;
      roundTeams[randomIndex] = current;
    }

    for (let i = 0; i < roundTeams.length; i += 2) {
      const home = roundTeams[i];
      const away = roundTeams[i + 1];

      if (!home || !away) {
        continue;
      }

      const homeLineup = this.lineupController.chooseNpcLineup(home);
      const awayLineup = this.lineupController.chooseNpcLineup(away);
      const cpuResult: MatchResult = this.matchController.simulateMatch(homeLineup, awayLineup);
      this.registerMatchResult(home, away, cpuResult.homeGoals, cpuResult.awayGoals);
    }
  }

  
  private registerMatchResult(homeTeam: Team, awayTeam: Team, homeGoals: number, awayGoals: number): void {
    const homeStanding = this.standings.get(homeTeam.name);
    const awayStanding = this.standings.get(awayTeam.name);

    if (!homeStanding || !awayStanding) {
      return;
    }

    homeStanding.played += 1;
    awayStanding.played += 1;

    homeStanding.goalsFor += homeGoals;
    homeStanding.goalsAgainst += awayGoals;
    awayStanding.goalsFor += awayGoals;
    awayStanding.goalsAgainst += homeGoals;

    if (homeGoals > awayGoals) {
      homeStanding.wins += 1;
      homeStanding.points += 3;
      awayStanding.losses += 1;
      return;
    }

    if (homeGoals < awayGoals) {
      awayStanding.wins += 1;
      awayStanding.points += 3;
      homeStanding.losses += 1;
      return;
    }

    homeStanding.draws += 1;
    awayStanding.draws += 1;
    homeStanding.points += 1;
    awayStanding.points += 1;
  }

  
  private getSortedStandings(): TeamStanding[] {
    return Array.from(this.standings.values()).sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      const bGoalDiff = b.goalsFor - b.goalsAgainst;
      const aGoalDiff = a.goalsFor - a.goalsAgainst;

      if (bGoalDiff !== aGoalDiff) {
        return bGoalDiff - aGoalDiff;
      }

      return b.goalsFor - a.goalsFor;
    });
  }

  
  private async finishSeason(): Promise<void> {
    const sorted = this.getSortedStandings();
    const champion = sorted[0];

    this.ui.clear();
    this.ui.printTitle(`FIM DA TEMPORADA ${this.season}`);

    if (champion) {
      this.ui.print(`Campeão: ${champion.team.name} com ${champion.points} pontos`);
    }

    this.ui.print("\nClassificação final:");
    sorted.forEach((standing, index) => {
      this.ui.print(
        `${index + 1}º ${standing.team.name} - ${standing.points} pts (V${standing.wins}/E${standing.draws}/D${standing.losses})`
      );
    });

    this.season += 1;
    this.initializeChampionship();
    this.ui.print("\nNova temporada iniciada!");
    await this.ui.pause();
  }

  
  private async saveAndExit(): Promise<void> {
    this.ui.clear();
    this.ui.printTitle("SALVAR E SAIR");
    this.ui.print("Escolha como deseja sair da campanha:\n");

    const choice = await this.ui.menu("", ["Salvar campanha e voltar ao menu", "Voltar ao menu sem salvar"]);

    if (choice === 1) {
      const savePayload = this.buildSavePayload();
      await this.ui.showLoadingScreen("Salvando progresso da campanha...", 1200);
      await CampaignSaveService.saveCampaign(savePayload);
      this.ui.print(`\nCampanha salva em: ${CampaignSaveService.getSaveFilePath()}`);
      await this.ui.pause();
      return;
    }

    this.ui.print("\nSaindo sem salvar alterações desta sessão.");
    await this.ui.pause();
  }

  
  private buildSavePayload(): SavedCampaign {
    if (!this.selectedTeam) {
      throw new Error("Não é possível salvar sem time selecionado.");
    }

    const standings = this.getSortedStandings().map((standing) => ({
      teamName: standing.team.name,
      played: standing.played,
      wins: standing.wins,
      draws: standing.draws,
      losses: standing.losses,
      goalsFor: standing.goalsFor,
      goalsAgainst: standing.goalsAgainst,
      points: standing.points
    }));

    return {
      coachName: this.coachName,
      season: this.season,
      round: this.round,
      selectedTeamName: this.selectedTeam.name,
      fixtures: this.fixtures.map((team) => team.name),
      standings,
      teams: CampaignSaveService.buildSavedTeams(teams),
      savedAt: new Date().toISOString()
    };
  }
}

