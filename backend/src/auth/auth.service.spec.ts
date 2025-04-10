import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  // Mock des services requis
  const mockUserService = {
    validateUser: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('devrait être défini', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('devrait retourner un utilisateur lorsque les identifiants sont valides', async () => {
      // Arrangement
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashed_password',
      };
      mockUserService.validateUser.mockResolvedValue(mockUser);

      // Action
      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      // Assertion
      expect(userService.validateUser).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      );
      expect(result).toEqual(mockUser);
    });

    it('devrait lancer une UnauthorizedException lorsque les identifiants sont invalides', async () => {
      // Arrangement
      mockUserService.validateUser.mockResolvedValue(null);

      // Action & Assertion
      await expect(
        service.validateUser('test@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
      expect(userService.validateUser).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      );
    });
  });

  describe('register', () => {
    it('devrait créer un nouvel utilisateur et retourner ses données sans le mot de passe', async () => {
      // Arrangement
      const registerDto: RegisterDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
      };
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed_password',
      };
      mockUserService.create.mockResolvedValue(mockUser);

      // Action
      const result = await service.register(registerDto);

      // Assertion
      expect(userService.create).toHaveBeenCalledWith(
        registerDto.username,
        registerDto.email,
        registerDto.password,
      );
      expect(result).toEqual({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      });
      // Vérifier que la propriété password n'existe pas dans le résultat
      expect(result).not.toHaveProperty('password');
    });

    it("devrait propager une BadRequestException en cas d'erreur lors de la création", async () => {
      // Arrangement
      const registerDto: RegisterDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
      };
      mockUserService.create.mockRejectedValue(new Error('Email déjà utilisé'));

      // Action & Assertion
      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(userService.create).toHaveBeenCalledWith(
        registerDto.username,
        registerDto.email,
        registerDto.password,
      );
    });
  });

  describe('login', () => {
    it("devrait retourner un token JWT et les informations utilisateur lors d'une connexion réussie", async () => {
      // Arrangement
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashed_password',
      };
      mockUserService.validateUser.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      // Action
      const result = await service.login(loginDto);

      // Assertion
      expect(userService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        username: mockUser.username,
      });
      expect(result).toEqual({
        access_token: 'jwt-token',
        user: {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
        },
      });
    });

    it('devrait lancer une UnauthorizedException lorsque les identifiants sont invalides', async () => {
      // Arrangement
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };
      mockUserService.validateUser.mockResolvedValue(null);

      // Action & Assertion
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });
  });

  describe('verifyToken', () => {
    it('devrait retourner les données décodées lorsque le token est valide', () => {
      // Arrangement
      const token = 'valid-jwt-token';
      const decodedToken = {
        email: 'test@example.com',
        sub: 1,
        username: 'testuser',
      };
      mockJwtService.verify.mockReturnValue(decodedToken);

      // Action
      const result = service.verifyToken(token);

      // Assertion
      expect(jwtService.verify).toHaveBeenCalledWith(token);
      expect(result).toEqual(decodedToken);
    });

    it('devrait lancer une UnauthorizedException lorsque le token est invalide', () => {
      // Arrangement
      const token = 'invalid-jwt-token';
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token expiré');
      });

      // Action & Assertion
      expect(() => service.verifyToken(token)).toThrow(UnauthorizedException);
      expect(jwtService.verify).toHaveBeenCalledWith(token);
    });
  });
});
