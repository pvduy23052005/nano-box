import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserEntity } from 'src/modules/user/domain/user.entity';
import { UserRepositoryAdapter } from 'src/modules/user/applications/ports/user.port';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UserRepository implements UserRepositoryAdapter {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  private toEntity(doc: UserDocument): UserEntity {
    return UserEntity.restore({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      password: doc.password,
      status: doc.status,
    });
  }

  private toPersistence(user: UserEntity) {
    return {
      name: user.getName(),
      email: user.getEmail(),
      password: user.getPassword(),
      status: user.getStatus(),
    };
  }

  async save(user: UserEntity): Promise<UserEntity> {
    const id = user.getId();
    const persistenceData = this.toPersistence(user);

    if (id) {
      const updated = await this.userModel.findByIdAndUpdate(
        id,
        persistenceData,
        { new: true },
      );

      if (!updated) {
        throw new NotFoundException(`Người dùng không tồn tại`);
      }
      return this.toEntity(updated);
    }

    const created = new this.userModel(persistenceData);
    const saved = await created.save();
    return this.toEntity(saved);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userModel.findOne({ email }).lean().exec();
    return user ? this.toEntity(user) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.userModel.findById(id).lean().exec();
    return user ? this.toEntity(user) : null;
  }
}
