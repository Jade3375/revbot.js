import { Event, Events } from "./event";

/**
 * Represents the event handler for a member leaving a server.
 * @private
 * @extends Event
 */
export class ServerMemberLeave extends Event {
  /**
   * Handles the server member leave event.
   *
   * @param {{ id: string; user: string }} data - The data for the event, containing the server ID and user ID.
   * @returns {{ server: unknown; member?: unknown }} An object containing the server and the member who left, or just the server if the member is not found.
   */
  handle(data: { id: string; user: string }): unknown {
    const server = this.client.servers.cache.get(data.id);

    if (server) {
      const member = server.members.cache.get(data.user);

      if (member) {
        server.members._remove(member.id);
        this.client.emit(Events.SERVER_MEMBER_LEAVE, member);
      }

      return { server, member };
    }

    return { server };
  }
}
