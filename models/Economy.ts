export class Economy {
  constructor(private _balance: number) {
    if (_balance < 0) {
      throw new Error("Saldo inicial não pode ser negativo.");
    }
  }

  public get balance(): number {
    return this._balance;
  }

  public credit(amount: number): void {
    if (amount < 0) {
      throw new Error("Valor de crédito não pode ser negativo.");
    }
    this._balance += amount;
  }

  public debit(amount: number): void {
    if (amount < 0) {
      throw new Error("Valor de débito não pode ser negativo.");
    }
    if (amount > this._balance) {
      throw new Error("Saldo insuficiente para realizar a transação.");
    }
    this._balance -= amount;
  }
}
