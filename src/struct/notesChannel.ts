import type { Channel as APIChannel } from "revolt-api";
import { Channel, Message, User } from "./index";
import { TextBasedChannel } from "./interfaces/baseChannel";
import { client } from "../client/client";
import {
  MessageManager,
  MessageOptions,
  MessageResolvable,
} from "../managers/index";
import { ChannelTypes } from "../utils/index";

type APINotesChannel = Extract<APIChannel, { channel_type: "SavedMessages" }>;

export class NotesChannel extends Channel implements TextBasedChannel {
  readonly type = ChannelTypes.NOTES;
  userId!: string;
  lastMessageId: string | null = null;
  messages = new MessageManager(this);
  constructor(client: client, data: APINotesChannel) {
    super(client);
    this._patch(data);
  }

  protected _patch(data: APINotesChannel): this {
    super._patch(data);

    if (data.user) {
      this.userId = data.user;
    }

    return this;
  }

  send(options: MessageOptions | string): Promise<Message> {
    return this.messages.send(options);
  }

  bulkDelete(
    messages: MessageResolvable[] | Map<string, Message> | number,
  ): Promise<void> {
    return this.messages.bulkDelete(messages);
  }

  get lastMessage(): Message | null {
    if (!this.lastMessageId) return null;
    return this.messages.cache.get(this.lastMessageId) ?? null;
  }

  get user(): User {
    return this.client.user!;
  }
}
