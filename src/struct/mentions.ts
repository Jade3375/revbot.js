import { MessageStruct, ServerMember, User } from "./index";
import { client } from "../client/client";
import { UserResolvable } from "../managers/index";

/**
 * Represents the mentions in a message, including users and server members.
 */
export class Mentions {
  /** The client instance. */
  public readonly client: client;

  /**
   * Creates a new Mentions instance.
   *
   * @param {Message} message - The message associated with the mentions.
   * @param {string[]} _users - An array of user IDs mentioned in the message.
   */
  constructor(
    public readonly message: MessageStruct,
    protected _users: string[],
  ) {
    this.client = message.client;
  }

  /**
   * Checks if a specific user is mentioned in the message.
   *
   * @param {UserResolvable} user - The user to check.
   * @returns {boolean} `true` if the user is mentioned, otherwise `false`.
   * @throws {TypeError} Throws an error if the user cannot be resolved.
   *
   * @example
   * ```typescript
   * if (mentions.has(someUser)) {
   *   console.log("User is mentioned!");
   * }
   * ```
   */
  has(user: UserResolvable): boolean {
    const id = this.client.users.resolveId(user);
    if (!id) throw new TypeError("INVALID_TYPE");
    return this._users.includes(id);
  }

  /**
   * Retrieves the server members mentioned in the message.
   *
   * @returns {Map<string, ServerMember> | null} A map of user IDs to `ServerMember` instances, or `null` if the message is not in a server.
   *
   * @example
   * ```typescript
   * const members = mentions.members;
   * if (members) {
   *   members.forEach(member => console.log(member.displayName));
   * }
   * ```
   */
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

  /**
   * Retrieves the users mentioned in the message.
   *
   * @returns {Map<string, User>} A map of user IDs to `User` instances.
   *
   * @example
   * ```typescript
   * const users = mentions.users;
   * users.forEach(user => console.log(user.username));
   * ```
   */
  get users(): Map<string, User> {
    const users = new Map<string, User>();

    for (const userId of this._users) {
      const user = this.client.users.cache.get(userId);
      if (user) users.set(user.id, user);
    }

    return users;
  }
}
