import { Position } from "./Position";

export abstract class Person {
  constructor(
    protected _name: string = "",
    protected _age: number = 0,
    protected _number: number = 0,
    protected _overall: number = 0,
    protected _transfer: number = 0,
    protected _position: string = "",
    protected _stamina: number = 100
  ) {}

  public get name(): string {
    return this._name;
  }

  public set name(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("Nome não pode ser vazio.");
    }
    this._name = value;
  }

  public get position(): Position {
    return this._position as Position;
  }

  public set position(value: Position) {
    this._position = value;
  }

  public get overall(): number {
    return this._overall;
  }

  public set overall(value: number) {
    if (value < 1 || value > 100) {
      throw new Error("Overall deve estar entre 1 e 100.");
    }
    this._overall = value;
  }

  public get transfer(): number {
    return this._transfer;
  }

  public set transfer(value: number) {
    if (value < 0) {
      throw new Error("Valor de transferência não pode ser negativo.");
    }
    this._transfer = value;
  }

  public get number(): number {
    return this._number;
  }

  public set number(value: number) {
    if (value < 1 || value > 99) {
      throw new Error("Número da camisa deve estar entre 1 e 99.");
    }
    this._number = value;
  }

  public get age(): number {
    return this._age;
  }

  public set age(value: number) {
    if (value < 15 || value > 100) {
      throw new Error("Idade deve estar entre 15 e 100.");
    }
    this._age = value;
  }

  public get stamina(): number {
    return this._stamina;
  }

  public set stamina(value: number) {
    this._stamina = Math.max(0, Math.min(100, value));
  }
}
