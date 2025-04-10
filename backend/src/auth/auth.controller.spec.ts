import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  // Mock du service d'authentification
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('devrait être défini', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it("devrait appeler authService.register avec les données d'inscription", async () => {
      // Arrangement
      const registerDto: RegisterDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
      };
      const expectedResult = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      };
      mockAuthService.register.mockResolvedValue(expectedResult);

      // Action
      const result = await controller.register(registerDto);

      // Assertion
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it("devrait appeler authService.login avec les informations d'identification", async () => {
      // Arrangement
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };
      const expectedResult = {
        access_token: 'jwt-token',
        user: {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
        },
      };
      mockAuthService.login.mockResolvedValue(expectedResult);

      // Action
      const result = await controller.login(loginDto);

      // Assertion
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getProfile', () => {
    it("devrait retourner les informations de profil de l'utilisateur depuis la requête", () => {
      // Arrangement
      const req = {
        user: {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
        },
      };

      // Action
      const result = controller.getProfile(req);

      // Assertion
      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
      });
    });
  });
});
