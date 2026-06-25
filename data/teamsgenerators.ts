import { Economia } from "../models/Economia";
import { Estadio } from "../models/Estadio";
import { Player } from "../models/Player";
import { Team } from "../models/Team";
import { generateTeamRoster } from "./playersgenerators";

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
    new Estadio("Arena do Gremio", 55000, 0),
    new Economia(100000)
  ),
  new Team(
    "Internacional",
    interPlayers,
    new Estadio("Beira-Rio", 50842, 0),
    new Economia(100000)
  ),
  new Team(
    "Flamengo",
    flamengoPlayers,
    new Estadio("Maracana", 78838, 0),
    new Economia(100000)
  ),
  new Team(
    "Palmeiras",
    palmeirasPlayers,
    new Estadio("Allianz Parque", 43713, 0),
    new Economia(100000)
  ),
  new Team(
    "Corinthians",
    corinthiansPlayers,
    new Estadio("Neo Quimica Arena", 49205, 0),
    new Economia(100000)
  ),
  new Team(
    "Botafogo",
    botafogoPlayers,
    new Estadio("General Severiano", 27913, 0),
    new Economia(100000)
  ),
  new Team(
    "Vasco",
    vascoPlayers,
    new Estadio("São Januário", 24902, 0),
    new Economia(100000)
  ),
  new Team(
    "São Paulo",
    sãoPauloPlayers,
    new Estadio("Morumbi", 72788, 0),
    new Economia(100000)
  )
];
