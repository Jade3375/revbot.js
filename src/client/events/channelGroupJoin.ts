import { Event, Events } from "./event";

/**
 * Represents the event handler for a user joining a group channel.
 *
 * @extends Event
 */
export class ChannelGroupJoin extends Event {
  /**
   * Handles the group channel join event.
   *
   * @param {{ id: string; user: string }} data - The data for the event, containing the channel ID and user ID.
   * @returns {Promise<{ channel: unknown; user: unknown }>} A promise that resolves with the updated channel and user.
   */
  async handle(data: { id: string; user: string }): Promise<unknown> {
    const channel = this.client.channels.cache.get(data.id);
    const user = await this.client.users.fetch(data.user, { force: false });

    if (channel?.isGroup()) {
      channel.users.set(user.id, user);
      this.client.emit(Events.GROUP_JOIN, channel, user);
    }

    return { channel, user };
  }
}
