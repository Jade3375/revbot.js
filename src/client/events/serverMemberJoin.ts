import { Event, Events } from "./event";

/**
 * Represents the event handler for a member joining a server.
 * @private
 * @extends Event
 */
export class ServerMemberJoin extends Event {
  /**
   * Handles the server member join event.
   *
   * @param {{ id: string; user: string }} data - The data for the event, containing the server ID and user ID.
   * @returns {Promise<{ member: unknown }>} A promise that resolves with the joined member.
   */
  async handle(data: { id: string; user: string }): Promise<unknown> {
    let server = this.client.servers.cache.get(data.id);

    if (!server) {
      server = await this.client.servers.fetch(data.id);
      this.client.emit(Events.SERVER_CREATE, server);
    }

    const member = await server.members.fetch(data.user);

    server.members.cache.set(member.id, member);

    this.client.emit(Events.SERVER_MEMBER_JOIN, member);

    return { member };
  }
}
