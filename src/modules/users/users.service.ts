import { Injectable } from '@nestjs/common';
import { UsersRepository } from '@modules/users/users.repository';
import { users } from '@common/database/schema';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(input: typeof users.$inferInsert) {
    return this.usersRepository.create(input);
  }

  async findUserByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  async findUserById(id: string) {
    return this.usersRepository.findById(id);
  }
}
