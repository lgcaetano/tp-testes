import { Controller, Post, HttpCode, Header, Headers } from '@nestjs/common';
import { Body } from '@nestjs/common/decorators';
import { HttpStatus } from '@nestjs/common/enums';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignUpDto) {
    return this.authService.signup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: SignInDto, @Headers('Origin') referer: string) {
    console.log(referer);
    return this.authService.signin(dto);
  }
}
