import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './../src/user/entities/user.entity';
import { Movie } from './../src/movies/entities/movie.entity';
import { Reservation } from './../src/reservation/entities/reservation.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockMovieRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockReservationRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUserRepository)
      .overrideProvider(getRepositoryToken(Movie))
      .useValue(mockMovieRepository)
      .overrideProvider(getRepositoryToken(Reservation))
      .useValue(mockReservationRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('Auth', () => {
    it('/auth/register (POST) - should register a new user', () => {
      const user = {
        id: 1,
        email: 'test@example.com',
      };

      mockUserRepository.save.mockResolvedValue(user);

      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
          expect(res.body.email).toBe('test@example.com');
        });
    });

    it('/