import { Event, Events } from "./event";

/**
 * Represents the event handler for server role deletions.
 * @private
 * @extends Event
 */
export class ServerRoleDelete extends Event {
  /**
   * Handles the server role deletion event.
   *
   * @param {{ id: string; role_id: string }} data - The data for the event, containing the server ID and role ID.
   * @returns {{ role: unknown } | {}} An object containing the deleted role, or an empty object if the role or server is not found.
   */
  handle(data: { id: string; role_id: string }): unknown {
    const server = this.client.servers.cache.get(data.id);

    if (server) {
      const role = server.roles.cache.get(data.role_id);

      if (role) {
        server.roles._remove(role.id);
        this.client.emit(Events.ROLE_DELETE, role);
      }

      return { role };
    }

    return {};
  }
}
