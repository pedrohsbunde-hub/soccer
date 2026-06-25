import { Economy } from "./Economy";

describe("Economy Class (Domain Model)", () => {
  test("deve creditar valor ao saldo corretamente", () => {
    const economy = new Economy(50000);

    economy.credit(10000);

    expect(economy.balance).toBe(60000);
  });

  test("deve debitar valor do saldo quando houver saldo suficiente", () => {
    const economy = new Economy(50000);

    economy.debit(20000);

    expect(economy.balance).toBe(30000);
  });

  test("deve lançar erro ao tentar debitar valor maior que o saldo", () => {
    const economy = new Economy(10000);

    expect(() => {
      economy.debit(15000);
    }).toThrow("Saldo insuficiente para realizar a transação.");
  });

  test("deve lançar erro ao instanciar, creditar ou debitar valores negativos", () => {
    expect(() => {
      new Economy(-100);
    }).toThrow("Saldo inicial não pode ser negativo.");

    const economy = new Economy(100);

    expect(() => {
      economy.credit(-50);
    }).toThrow("Valor de crédito não pode ser negativo.");

    expect(() => {
      economy.debit(-20);
    }).toThrow("Valor de débito não pode ser negativo.");
  });
});
