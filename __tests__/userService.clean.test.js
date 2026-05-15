const { UserService } = require('../src/userService');

const USUARIO_PADRAO = {
  nome: 'Fulano de Tal',
  email: 'fulano@teste.com',
  idade: 25,
};

describe('UserService - Testes Limpos', () => {
  let userService;

  beforeEach(() => {
    // Arrange: Setup
    userService = new UserService();
    userService._clearDB();
  });

  describe('Criação de usuários', () => {
    test('deve criar um usuário com dados válidos', () => {
      // Arrange
      const { nome, email, idade } = USUARIO_PADRAO;

      // Act
      const usuarioCriado = userService.createUser(nome, email, idade);

      // Assert
      expect(usuarioCriado.id).toBeDefined();
      expect(usuarioCriado.nome).toBe(nome);
      expect(usuarioCriado.email).toBe(email);
      expect(usuarioCriado.idade).toBe(idade);
    });

    test('deve definir status como "ativo" ao criar um novo usuário', () => {
      // Arrange
      const { nome, email, idade } = USUARIO_PADRAO;

      // Act
      const usuarioCriado = userService.createUser(nome, email, idade);

      // Assert
      expect(usuarioCriado.status).toBe('ativo');
    });

    test('deve lançar erro ao criar usuário menor de idade', () => {
      // Arrange
      const idadeMenorDeIdade = 17;

      // Act & Assert
      expect(() => {
        userService.createUser('Menor', 'menor@email.com', idadeMenorDeIdade);
      }).toThrow('O usuário deve ser maior de idade.');
    });
  });

  describe('Busca de usuários', () => {
    test('deve buscar um usuário criado pelo ID', () => {
      // Arrange
      const { nome, email, idade } = USUARIO_PADRAO;
      const usuarioCriado = userService.createUser(nome, email, idade);

      // Act
      const usuarioBuscado = userService.getUserById(usuarioCriado.id);

      // Assert
      expect(usuarioBuscado).toEqual(usuarioCriado);
      expect(usuarioBuscado.nome).toBe(nome);
    });

    test('deve retornar undefined ao buscar usuário inexistente', () => {
      // Arrange
      const idInexistente = 999;

      // Act
      const usuarioBuscado = userService.getUserById(idInexistente);

      // Assert
      expect(usuarioBuscado).toBeUndefined();
    });
  });

  describe('Desativação de usuários', () => {
    test('deve desativar um usuário comum com sucesso', () => {
      // Arrange
      const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);

      // Act
      const resultado = userService.deactivateUser(usuarioComum.id);

      // Assert
      expect(resultado).toBe(true);
    });

    test('deve definir status como "inativo" após desativar um usuário comum', () => {
      // Arrange
      const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);

      // Act
      userService.deactivateUser(usuarioComum.id);
      const usuarioAtualizado = userService.getUserById(usuarioComum.id);

      // Assert
      expect(usuarioAtualizado.status).toBe('inativo');
    });

    test('deve impedir a desativação de um usuário administrador', () => {
      // Arrange
      const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

      // Act
      const resultado = userService.deactivateUser(usuarioAdmin.id);

      // Assert
      expect(resultado).toBe(false);
    });

    test('deve manter o status "ativo" quando tentar desativar um administrador', () => {
      // Arrange
      const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

      // Act
      userService.deactivateUser(usuarioAdmin.id);
      const usuarioAtualizado = userService.getUserById(usuarioAdmin.id);

      // Assert
      expect(usuarioAtualizado.status).toBe('ativo');
    });
  });

  describe('Relatório de usuários', () => {
    test('deve gerar um relatório contendo usuários cadastrados', () => {
      // Arrange
      const usuario1 = userService.createUser('Alice', 'alice@email.com', 28);
      const usuario2 = userService.createUser('Bob', 'bob@email.com', 32);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('Alice');
      expect(relatorio).toContain('Bob');
      expect(relatorio).toContain(usuario1.id.toString());
      expect(relatorio).toContain(usuario2.id.toString());
    });

    test('deve incluir status dos usuários no relatório', () => {
      // Arrange
      userService.createUser('Alice', 'alice@email.com', 28);
      userService.createUser('Bob', 'bob@email.com', 32);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('ativo');
    });

    test('deve incluir cabeçalho no relatório de usuários', () => {
      // Arrange
      userService.createUser('Alice', 'alice@email.com', 28);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toMatch(/relatório|usuário/i);
    });

    test('deve retornar um relatório vazio quando não há usuários', () => {
      // Arrange: nenhum usuário foi criado

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toBeDefined();
      expect(typeof relatorio).toBe('string');
    });
  });

  describe('Estado do banco de dados', () => {
    test('deve limpar o banco de dados corretamente', () => {
      // Arrange
      userService.createUser('Alice', 'alice@email.com', 28);
      userService.createUser('Bob', 'bob@email.com', 32);

      // Act
      userService._clearDB();
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).not.toContain('Alice');
      expect(relatorio).not.toContain('Bob');
    });
  });
});
