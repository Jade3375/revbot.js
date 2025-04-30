import { Event, Events } from "./event";

/**
 * Represents the event handler for a user leaving a group channel.
 *
 * @extends Event
 */
export class ChannelGroupLeave extends Event {
  /**
   * Handles the group channel leave event.
   *
   * @param {{ id: string; user: string }} data - The data for the event, containing the channel ID and user ID.
   * @returns {Promise<{ channel: unknown; user: unknown }>} A promise that resolves with the updated channel and user.
   */
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
