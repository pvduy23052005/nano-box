import { Query, Resolver } from '@nestjs/graphql';
import { ChatPayload } from '../dto/chat.payload';
import { GetMessagesUseCase } from '../../application/use-cases/get-message.use-case';

@Resolver()
export class ChatResolver {
  constructor(private readonly getMessagesUseCase: GetMessagesUseCase) {}

  @Query(() => [ChatPayload])
  async getMessages(): Promise<ChatPayload[]> {
    const messages = await this.getMessagesUseCase.execute();
    return messages.map((msg) => ({
      id: msg.id as string,
      content: msg.content,
      senderId: msg.senderId,
      attachments: msg.attachments,
    }));
  }
}
