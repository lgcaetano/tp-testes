import { Injectable } from '@nestjs/common';
import { PhysicalPerson } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async editUser(userId: string, newUser: Partial<PhysicalPerson>) {
    const oldUserInfo = await this.prisma.physicalPerson.findUnique({
      where: {
        id: userId,
      },
    });

    const getKeyValue = (key: string) =>
      newUser[key] ? newUser[key] : oldUserInfo[key];

    const infoToBeUpdated: typeof newUser = {};

    const updatableInfo: (keyof PhysicalPerson)[] = ['address', 'phone'];
    updatableInfo.forEach((key) => (infoToBeUpdated[key] = getKeyValue(key)));

    const updatedUser = await this.prisma.physicalPerson.update({
      where: {
        id: userId,
      },
      data: infoToBeUpdated,
    });

    delete updatedUser.hash;

    return updatedUser;
  }
}
