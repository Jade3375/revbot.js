import type { User as APIUser } from "revolt-api";
import { BaseManager } from "./baseManager";
import { MessageStruct, User } from "../struct/index";

export type UserResolvable = User | APIUser | MessageStruct | string;

export class UserManager extends BaseManager<User, APIUser> {
  holds = User;

  /**
   *
   * @param user The user to fetch
   * @returns A promise that resolves when the user is fetched
   */
  async fetch(user: UserResolvable, { force = false } = {}): Promise<User> {
    const id = this.resolveId(user);

    if (!id) throw new TypeError("INVALID_TYPE");

    if (!force) {
      const user = this.cache.get(id);
      if (user) return user;
    }

    const data = (await this.client.api.get(`/users/${id}`)) as APIUser;

    return this._add(data);
  }

  /**
   * get a user form cache
   * @param resolvable The user to resolve
   * @returns The user or null if it cannot be resolved
   */
  resolve(resolvable: MessageStruct | User): User;
  resolve(resolvable: string | APIUser): User | null;
  resolve(resolvable: User | APIUser | string | MessageStruct): User | null {
    if (resolvable instanceof MessageStruct) return resolvable.author;
    return super.resolve(resolvable);
  }

  /**
   * get a user id form cache
   * @param resolvable The user to resolve
   * @returns The user id or null if it cannot be resolved
   */
  resolveId(resolvable: UserResolvable): string | null {
    if (resolvable instanceof MessageStruct) return resolvable.authorId;
    return super.resolveId(resolvable);
  }
}
