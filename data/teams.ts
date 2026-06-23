import { Economia } from "../models/Economia";
import { Player } from "../models/Player";
import { Team } from "../models/Team";
import { generateTeamRoster } from "./players";

const gremioPlayers: Player[] = generateTeamRoster("Gremio");
const interPlayers: Player[] = generateTeamRoster("Internacional");
const flamengoPlayers: Player[] = generateTeamRoster("Flamengo");
const palmeirasPlayers: Player[] = generateTeamRoster("Palmeiras");
const corinthiansPlayers: Player[] = generateTeamRoster("Corinthians");
const botafogoPlayers: Player[] = generateTeamRoster("Botafogo");
const vascoPlayers: Player[] = generateTeamRoster("Vasco");
const sãoPauloPlayers: Player[] = generateTeamRoster("São Paulo");

export const teams: Team[] = [
  new Team(
    "Gremio",
    gremioPlayers,
    new Economia(100000)
  ),
  new Team(
    "Internacional",
    interPlayers,
    new Economia(100000)
  ),
  new Team(
    "Flamengo",
    flamengoPlayers,
    new Economia(100000)
  ),
  new Team(
    "Palmeiras",
    palmeirasPlayers,
    new Economia(100000)
  ),
  new Team(
    "Corinthians",
    corinthiansPlayers,
    new Economia(100000)
  ),
  new Team(
    "Botafogo",
    botafogoPlayers,
    new Economia(100000)
  ),
  new Team(
    "Vasco",
    vascoPlayers,
    new Economia(100000)
  ),
  new Team(
    "São Paulo",
    sãoPauloPlayers,
    new Economia(100000)
  )
];
