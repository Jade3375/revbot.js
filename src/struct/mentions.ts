import { Message, ServerMember, User } from "./index";
import { client } from "../client/client";
import { UserResolvable } from "../managers/index";

export class Mentions {
  public readonly client: client;

  constructor(
    public readonly message: Message,
    protected _users: string[],
  ) {
    this.client = message.client;
  }

  has(user: UserResolvable): boolean {
    const id = this.client.users.resolveId(user);
    if (!id) throw new TypeError("INVALID_TYPE");
    return this._users.includes(id);
  }

  get members(): Map<string, ServerMember> | null {
    const server = this.message.server;

    if (!server) return null;

    const members = new Map<string, ServerMember>();

    for (const userId of this._users) {
      const member = server.members.cache.get(userId);
      if (member) members.set(member.id, member);
    }

    return members;
  }

  get users(): Map<string, User> {
    const users = new Map<string, User>();

    for (const userId of this._users) {
      const user = this.client.users.cache.get(userId);
      if (user) users.set(user.id, user);
    }

    return users;
  }
}
