import { Attachment, Base, DMChannel, Presence, Status } from "./index";
import type {
  User as APIUser,
  FieldsUser,
  Channel as APIChannel,
} from "revolt-api";
import { client } from "../client/client";
import { Badges, UUID } from "../utils/index";

export class User extends Base {
  username!: string;
  avatar: Attachment | null = null;
  presence = new Presence(this.client);
  badges!: Badges;
  bot = false;

  constructor(client: client, data: APIUser) {
    super(client);
    this._patch(data);
  }

  protected _patch(data: APIUser, clear: FieldsUser[] = []): this {
    super._patch(data);

    if (data.username) {
      this.username = data.username;
    }

    if (data.bot) {
      this.bot = true;
    }

    if (typeof data.badges === "number") {
      this.badges = new Badges(data.badges).freeze();
    }

    if (data.avatar) {
      this.avatar = new Attachment(this.client, data.avatar);
    }

    if (data.status) {
      this.presence.status = data.status.presence
        ? (Status[data.status.presence as keyof typeof Status] ??
          Status.Invisible)
        : Status.Invisible;
      this.presence.text = data.status.text ?? null;
    }

    for (const field of clear) {
      if (field === "Avatar") this.avatar = null;
      if (field === "StatusText") this.presence.text = null;
      if (field === "StatusPresence") this.presence.status = Status.Invisible;
    }

    return this;
  }

  get createdAt(): Date {
    return UUID.timestampOf(this.id);
  }

  get createdTimestamp(): number {
    return this.createdAt.getTime();
  }

  async block(): Promise<void> {
    await this.client.api.put(`/users/${this.id}/block`);
  }

  async unblock(): Promise<void> {
    await this.client.api.delete(`/users/${this.id}/block`);
  }

  async createDM(): Promise<DMChannel> {
    const data = await this.client.api.get(`/users/${this.id}/dm`);
    return this.client.channels._add(data as APIChannel) as DMChannel;
  }

  // avatarURL(options?: { size: number }): string | null {
  //   return this.avatar
  //     ? this.client.api.cdn.avatar(
  //         this.avatar.id,
  //         this.avatar.filename,
  //         options?.size,
  //       )
  //     : null;
  // }

  // async displayAvatarURL(options?: { size: number }): Promise<string> {
  //   const defaultAvatar = (await this.client.api.get(
  //     `/users/${this.id}/default_avatarr`,
  //   )) as string;
  //   return this.avatarURL(options) ?? defaultAvatar;
  // }

  fetch(force = true): Promise<User> {
    return this.client.users.fetch(this, { force });
  }

  toString(): string {
    return `<@${this.id}>`;
  }
}
