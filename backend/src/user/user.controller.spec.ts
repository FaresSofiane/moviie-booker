import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user when user exists', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      mockUserService.findById.mockResolvedValue(mockUser);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockUser);
      expect(userService.findById).toHaveBeenCalledWith(1);
    });

    it('should return undefined when user does not exist', async () => {
      mockUserService.findById.mockResolvedValue(undefined);

      const result = await controller.findOne('999');

      expect(result).toBeUndefined();
      expect(userService.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('getMe', () => {
    it('should return the authenticated user without password', async () => {
      const mockRequest = {
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          password: 'hashedpassword',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      const expectedResponse = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        createdAt: mockRequest.user.createdAt,
        updatedAt: mockRequest.user.updatedAt,
      };

      const result = controller.getMe(mockRequest);

      expect(result).toEqual(expectedResponse);
      expect(result).not.toHaveProperty('password');
    });
  });
});
