import { Event, Events } from "./event";

export class ChannelGroupLeave extends Event {
  async handle(data: { id: string; user: string }): Promise<unknown> {
    const channel = this.client.channels.cache.get(data.id);
    const user = await this.client.users.fetch(data.user, { force: false });

    if (channel?.isGroup()) {
      channel.users.delete(data.user);
      this.client.emit(Events.GROUP_LEAVE, channel, user);
    }

    return { channel, user };
  }
}
