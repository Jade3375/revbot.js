import { Event, API, Events } from "./event";

/**
 * Represents the event handler for channel creation.
 * @private
 * @extends Event
 */
export class ChannelCreate extends Event {
  /**
   * Handles the channel creation event.
   *
   * @param {API.Channel} data - The raw data for the created channel from the API.
   * @returns {Promise<{ channel: unknown }>} A promise that resolves with the created channel.
   * @private
   */
  async handle(data: API.Channel): Promise<unknown> {
    const channel = this.client.channels._add(data);

    if (channel) {
      if (channel.inServer()) {
        const server =
          channel.server ?? (await this.client.servers.fetch(channel.serverId));
        server.channels.cache.set(channel.id, channel);
      }
      this.client.emit(Events.CHANNEL_CREATE, channel);
    }

    return { channel };
  }
}
