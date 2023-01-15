import 'reflect-metadata';
import { INestApplication } from '@nestjs/common/interfaces';
import { ValidationPipe } from '@nestjs/common/pipes';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { SignUpDto, SignInDto } from '../src/auth/dto/auth.dto';
import {
  CreateBookmarkDto,
  EditBookmarkDto,
} from '../src/bookmark/dto/bookmark.dto';

const PORT = 3332;
const testURL = `http://localhost:${PORT}`;

const standards = {
  correctEmail: 'exemplo@porta.com.br',
  correctPassword: 'exemplodocaralho',
  wrongEmail: 'errado@porta.com.br',
  wrongPassword: 'erradodocaralho',
};

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.enableCors();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(PORT);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl(testURL);
  });

  afterAll(() => {
    app.close();
  });

  describe('auth', () => {
    describe('SignUp', () => {
      const dto: SignUpDto = {
        email: standards.correctEmail,
        address: 'Rua do Exemplo, Número 2',
        cpf: '14906808611',
        fullName: 'Exemplo da Silva',
        password: standards.correctPassword,
        phone: '31982010404',
      };

      const signUpURL = '/auth/signup';

      it('Should sign up', () => {
        return pactum.spec().post(signUpURL).withBody(dto).expectStatus(201);
      });

      it('Should not sign up the same user twice', () => {
        return pactum.spec().post(signUpURL).withBody(dto).expectStatus(403);
      });

      Object.keys(dto).forEach((key) => {
        it(`Should not sign up if ${key} is empty`, () => {
          const dtoCopy = { ...dto };
          delete dtoCopy[key];
          return pactum
            .spec()
            .post(signUpURL)
            .withBody(dtoCopy)
            .expectStatus(400);
        });
      });
    });

    describe('SignIn', () => {
      const signInURL = `/auth/signin`;

      it('Should sign in', () => {
        const dto: SignInDto = {
          email: standards.correctEmail,
          password: standards.correctPassword,
        };
        return pactum
          .spec()
          .post(signInURL)
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });

      it('Should return 400 if e-mail is empty', () => {
        return pactum
          .spec()
          .post(signInURL)
          .withBody({
            password: standards.correctPassword,
          })
          .expectStatus(400);
      });

      it('Should not sign in if password is wrong', () => {
        const dto: SignInDto = {
          email: standards.correctEmail,
          password: standards.wrongPassword,
        };
        return pactum.spec().post(signInURL).withBody(dto).expectStatus(401);
      });

      it('Should not sign in if e-mail is wrong', () => {
        const dto: SignInDto = {
          email: standards.wrongEmail,
          password: standards.correctPassword,
        };
        return pactum.spec().post(signInURL).withBody(dto).expectStatus(401);
      });

      it('Should throw 400 if password is empty', () => {
        const dto = {
          email: standards.correctEmail,
        };
        return pactum.spec().post(signInURL).withBody(dto).expectStatus(400);
      });

      it('Should throw 400 if e-mail is empty', () => {
        const dto = {
          password: standards.correctPassword,
        };
        return pactum.spec().post(signInURL).withBody(dto).expectStatus(400);
      });
    });
  });
  describe('user', () => {
    describe('Get me', () => {
      it('Should return current user', () => {
        return pactum
          .spec()
          .get('/user/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });
    describe('Edit user', () => {
      it('Should edit current user', () => {
        const dto: Partial<SignUpDto> = {
          address: 'Rua das Pedrinhas',
          phone: '219666242466',
        };
        return pactum
          .spec()
          .patch('/user/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.address)
          .expectBodyContains(dto.phone);
      });
    });
  });
  describe('bookmark', () => {
    describe('Get empty bookmarks', () => {
      it('should return an empty array of bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmark')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });
    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'Terceiro',
        link: 'www.google.com',
        description: 'Mecanismo de busca',
      };
      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmark')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.link)
          .expectBodyContains(dto.description)
          .stores('bookmarkId', 'id');
      });
      it('should not create bookmark if user is not logged in', () => {
        return pactum.spec().post('/bookmark').withBody(dto).expectStatus(401);
      });
    });
  });
  describe('Get bookmarks', () => {
    it('Should get bookmarks if logged in', () => {
      return pactum
        .spec()
        .get('/bookmark')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(200)
        .expectJsonLength(1);
    });
    it('Should not get bookmarks if not logged in', () => {
      return pactum.spec().get('/bookmark').expectStatus(401);
    });
  });
  describe('Get bookmarks by id', () => {
    it('should get bookmarks by id', () => {
      return pactum
        .spec()
        .get('/bookmark/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(200)
        .expectBodyContains('$S{bookmarkId}');
    });
  });
  describe('Edit bookmark  by id', () => {
    const dto: EditBookmarkDto = {
      title: 'Quarto',
      link: 'facebook.com',
      description: 'Rede socialzinha',
    };
    it('should edit bookmark by id with all fields', () => {
      return pactum
        .spec()
        .patch('/bookmark/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .withBody(dto)
        .expectStatus(200)
        .expectBodyContains('$S{bookmarkId}')
        .expectBodyContains(dto.title)
        .expectBodyContains(dto.link)
        .expectBodyContains(dto.description);
    });
    Object.keys(dto).forEach((key) => {
      it(`should update bookmark even when field ${key} is not present`, () => {
        const dtoCopy = { ...dto };
        delete dtoCopy[key];
        return pactum
          .spec()
          .patch('/bookmark/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });
  });
  describe('Delete bookmarks', () => {
    it('should delete bookmarks by id', () => {
      return pactum
        .spec()
        .delete('/bookmark/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(200)
        .expectBodyContains('$S{bookmarkId}');
    });
  });
});
