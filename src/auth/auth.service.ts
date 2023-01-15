import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto';
import * as argon from 'argon2';
import { Prisma } from '@prisma/client';
import {
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: SignUpDto) {
    const { address, cpf, email, fullName, phone, password } = dto;
    const hash = await argon.hash(password);
    try {
      const user = await this.prisma.physicalPerson.create({
        data: {
          address,
          cpf,
          email,
          fullName,
          phone,
          hash,
        },
      });

      return {
        access_token: await this.signToken(user.id, user.email),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Este e-mail já está cadastrado.');
        }
      }
    }
  }

  async signin(dto: SignInDto) {
    const user = await this.prisma.physicalPerson.findUnique({
      where: {
        email: dto.email,
      },
    });

    const credentialsException = new UnauthorizedException(
      'E-mail e/ou senha inválidos',
    );

    if (!user) throw credentialsException;

    const isCorrectPassword = await argon.verify(user.hash, dto.password);

    if (!isCorrectPassword) throw credentialsException;

    return {
      access_token: await this.signToken(user.id, user.email),
    };
  }

  signToken(userId: string, email: string) {
    const payload = {
      sub: userId,
      email,
    };

    return this.jwt.signAsync(payload, {
      expiresIn: '1h',
      secret: this.config.getOrThrow('JWT_SECRET'),
    });
  }
}
