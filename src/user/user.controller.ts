import { Controller, Get, UseGuards, Patch, Body } from '@nestjs/common';
import { PhysicalPerson } from '@prisma/client';
import { User } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { UserService } from './user.service';
import { SignUpDto } from '../auth/dto/auth.dto';

@Controller('user')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  getMe(@User() user: PhysicalPerson) {
    return user;
  }

  @Patch('me')
  updateMe(@User('id') user, @Body() body: Partial<SignUpDto>) {
    return this.userService.editUser(user, body);
  }
}
