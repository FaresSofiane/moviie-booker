import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
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
    it('should return a user by id', async () => {
      const user = new User();
      user.id = 1;
      user.email = 'test@example.com';

      jest.spyOn(userService, 'findOne').mockResolvedValue(user);

      const result = await controller.findOne('1');
      expect(result).toEqual(user);
      expect(userService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        { id: 1, email: 'test1@example.com' },
        { id: 2, email: 'test2@example.com' },
      ] as User[];

      jest.spyOn(userService, 'findAll').mockResolvedValue(users);

      const result = await controller.findAll();
      expect(result).toEqual(users);
      expect(userService.findAll).toHaveBeenCalled();
    });
  });
});