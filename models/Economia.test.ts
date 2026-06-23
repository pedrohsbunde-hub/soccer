import { Economia } from "./Economia";

describe("Economia Class (Domain Model)", () => {
  // Teste 1: Crédito bem-sucedido (Happy Path)
  test("deve creditar valor ao saldo corretamente", () => {
    // Arrange
    const economia = new Economia(50000);

    // Act
    economia.creditar(10000);

    // Assert
    expect(economia.saldo).toBe(60000);
  });

  // Teste 2: Débito bem-sucedido (Happy Path)
  test("deve debitar valor do saldo quando houver saldo suficiente", () => {
    // Arrange
    const economia = new Economia(50000);

    // Act
    economia.debitar(20000);

    // Assert
    expect(economia.saldo).toBe(30000);
  });

  // Teste 3: Erro por saldo insuficiente (Exception Path)
  test("deve lançar erro ao tentar debitar valor maior que o saldo", () => {
    // Arrange
    const economia = new Economia(10000);

    // Act & Assert
    expect(() => {
      economia.debitar(15000);
    }).toThrow("Saldo insuficiente para realizar a transação.");
  });

  // Teste 4: Erro por valores negativos (Exception Path)
  test("deve lançar erro ao instanciar, creditar ou debitar valores negativos", () => {
    // Arrange, Act & Assert (Constructor)
    expect(() => {
      new Economia(-100);
    }).toThrow("Saldo inicial não pode ser negativo.");

    const economia = new Economia(100);

    // Act & Assert (Creditar)
    expect(() => {
      economia.creditar(-50);
    }).toThrow("Valor de crédito não pode ser negativo.");

    // Act & Assert (Debitar)
    expect(() => {
      economia.debitar(-20);
    }).toThrow("Valor de débito não pode ser negativo.");
  });
});
