import type {
  Message,
  MessageManager,
  MessageOptions,
  MessageResolvable,
} from "../../index";

export interface TextBasedChannel {
  messages: MessageManager;
  lastMessageId: string | null;
  lastMessage: Message | null;
  send(options: MessageOptions | string): Promise<Message>;
  bulkDelete(
    messages: MessageResolvable[] | Map<string, Message> | number,
  ): Promise<void>;
}
