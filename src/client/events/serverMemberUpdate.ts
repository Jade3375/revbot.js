import { Event, API, Events } from "./event";

/**
 * Represents the event handler for server member updates.
 *
 * @extends Event
 */
export class ServerMemberUpdate extends Event {
  /**
   * Handles the server member update event.
   *
   * @param {{ id: string; data: API.Member }} data - The data for the event, containing the server ID and updated member data.
   * @returns {void}
   */
  handle(data: { id: string; data: API.Member }): void {
    const server = this.client.servers.cache.get(data.id);
    const member = server?.members.cache.get(data.data?._id?.user);
    const oldMember = member?._update(data.data);

    if (oldMember && member && !member.equals(oldMember)) {
      this.client.emit(Events.SERVER_MEMBER_UPDATE, oldMember, member);
    }
  }
}
