import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './entity/users.entity';

describe('UsersService', () => {
  let service: UsersService;
  const mockUserModel: Model<User> = {
    create: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken('Users'),
          useValue: new mockUserModel(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create a new user validation', () => {
    const mockUser: CreateUserDto = {
      username: 'username',
      email: 'email@gmail.com',
      password: 'password@123',
    };

    it('will create a new user', async () => {
      expect(await service.create(mockUser)).toBeCalled();
      // const spy = jest.spyOn(mockUserModel, 'create');
      // await mockUserModel.create(mockUser);
      // expect(spy).toHaveBeenCalledWith(mockUser);
      // expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
