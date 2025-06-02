import { Role } from "../../struct";
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
  handle(data: {
    id: { server: string; user: string };
    data: API.Member;
  }): void {
    const updateData = {
      ...data.data,
      _id: { server: data.id.server, user: data.id.user },
    };
    const server = this.client.servers.cache.get(data.id.server);
    const member = server?.members.cache.get(data.id.user);
    const oldMember = member?._update(updateData);

    console.log(oldMember);

    if (
      oldMember &&
      member &&
      (!member.equals(oldMember) ||
        areRolesDifferent(member.roles, oldMember.roles))
    ) {
      this.client.emit(Events.SERVER_MEMBER_UPDATE, oldMember, member);
    }
  }
}

/**
 * Compares the role IDs of two members and determines if they are different.
 *
 * @param {API.Role[]} rolesA - The roles of the first member.
 * @param {API.Role[]} rolesB - The roles of the second member.
 * @returns {boolean} - Returns true if the roles are different, otherwise false.
 */
function areRolesDifferent(rolesA: Role[], rolesB: Role[]): boolean {
  const idsA = rolesA.map((role) => role.id).sort();
  const idsB = rolesB.map((role) => role.id).sort();

  return (
    idsA.length !== idsB.length ||
    !idsA.every((id, index) => id === idsB[index])
  );
}
