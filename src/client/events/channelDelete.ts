import { Event, Events } from "./event";

export class ChannelDelete extends Event {
  handle(data: { id: string }): unknown {
    const channel = this.client.channels.cache.get(data.id);

    if (channel) {
      if (channel.inServer()) {
        channel.server?.channels.cache.delete(channel.id);
      }
      this.client.emit(Events.CHANNEL_DELETE, channel);
    }

    return { channel };
  }
}
