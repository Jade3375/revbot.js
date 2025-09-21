import { Event, API, Events } from "./event";
import { MessageReactData } from "./messageReact";

/**
 * Represents the event handler for message reaction removals.
 * @private
 * @extends Event
 */
export class MessageUnreact extends Event {
  /**
   * Handles the message reaction removal event.
   *
   * @param {MessageReactData} data - The data for the event, containing the message ID, channel ID, user ID, and emoji ID.
   * @returns {Promise<unknown>} A promise that resolves with an empty object.
   */
  async handle(data: MessageReactData): Promise<unknown> {
    const channel = this.client.channels.cache.get(data.channel_id);

    if (channel?.isText()) {
      let message = channel.messages.cache.get(data.id)
        ? channel.messages.cache.get(data.id)
        : await channel.messages.fetch(data.id);

      if (message) {
        const reaction = message.reactions.get(data.emoji_id);
        if (reaction) {
          const index = reaction.indexOf(data.user_id);
          if (index !== -1) {
            reaction.splice(index, 1);
          }
          if (reaction.length === 0) {
            message.reactions.delete(data.emoji_id);
          }
        }
        this.client.emit(Events.MESSAGE_REACT_REMOVE, message);
      }
    }

    return {};
  }
}
