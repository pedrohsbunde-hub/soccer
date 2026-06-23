export class Economia {
  constructor(private _saldo: number) {
    if (_saldo < 0) {
      throw new Error("Saldo inicial não pode ser negativo.");
    }
  }

  public get saldo(): number {
    return this._saldo;
  }

  public creditar(valor: number): void {
    if (valor < 0) {
      throw new Error("Valor de crédito não pode ser negativo.");
    }
    this._saldo += valor;
  }

  public debitar(valor: number): void {
    if (valor < 0) {
      throw new Error("Valor de débito não pode ser negativo.");
    }
    if (valor > this._saldo) {
      throw new Error("Saldo insuficiente para realizar a transação.");
    }
    this._saldo -= valor;
  }
}
