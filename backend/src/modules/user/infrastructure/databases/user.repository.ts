import { Model, Types } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserEntity } from 'src/modules/user/domain/user.entity';
import { UserRepositoryAdapter } from 'src/modules/user/applications/ports/user.port';
import { User, UserDocument } from './user.schema';
import { escapeRegex } from 'src/common/utils/regex.util';
import { UserStatus } from 'src/modules/user/domain/user.type';

interface UserDocLike {
  _id?: Types.ObjectId | string | null;
  name: string;
  email: string;
  password?: string;
  status?: UserStatus;
  avatar?: string;
}

@Injectable()
export class UserRepository implements UserRepositoryAdapter {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  private toEntity(doc: UserDocLike): UserEntity {
    return UserEntity.restore({
      id: doc._id?.toString() ?? '',
      name: doc.name,
      email: doc.email,
      password: doc.password || '',
      status: doc.status ?? UserStatus.ACTIVE,
      avatar: doc.avatar || '',
    });
  }

  private toPersistence(user: UserEntity) {
    return {
      name: user.getName(),
      email: user.getEmail(),
      password: user.getPassword(),
      status: user.getStatus(),
      avatar: user.getAvatar(),
    };
  }

  async save(user: UserEntity): Promise<UserEntity> {
    const id = user.getId();
    const persistenceData = this.toPersistence(user);

    if (id) {
      const updated = await this.userModel
        .findByIdAndUpdate(id, persistenceData, { returnDocument: 'after' })
        .lean()
        .exec();

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

  async findAll(search?: string, limit: number = 20): Promise<UserEntity[]> {
    const cleanSearch = search?.trim();
    const query: Record<string, unknown> = cleanSearch
      ? {
          $or: [
            { name: { $regex: escapeRegex(cleanSearch), $options: 'i' } },
            { email: { $regex: escapeRegex(cleanSearch), $options: 'i' } },
          ],
        }
      : {};

    const safeLimit = Math.min(Math.max(Number(limit || 20), 1), 50);

    const users = await this.userModel
      .find(query)
      .select('name email avatar status')
      .limit(safeLimit)
      .lean()
      .exec();

    return users.map((user) => this.toEntity(user));
  }
}
