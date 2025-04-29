import type { Role as APIRole } from "revolt-api";
import { BaseManager } from "./baseManager";
import { Role, Server } from "../struct/index";

export type RoleResolvable = Role | string;

export class RoleManager extends BaseManager<Role, APIRole & { id: string }> {
  holds = Role;
  constructor(protected readonly server: Server) {
    super(server.client);
  }

  _add(data: APIRole & { id: string }): Role {
    const role = new Role(this.server, data);
    this.cache.set(role.id, role);
    return role;
  }

  /**
   * creates a new role in the server
   * @param name The name of the role to create
   * @returns
   */
  async create(name: string): Promise<Role> {
    const { id, role } = await this.client.api.post<{
      id: string;
      role: APIRole;
    }>(`/servers/${this.server.id}/roles`, { body: { name } });
    return this._add(Object.assign(role, { id }));
  }

  /**
   * deletes a role from the server
   * @param role the role to delete
   * @returns A promise that resolves when the role is deleted
   */
  async delete(role: RoleResolvable): Promise<void> {
    const id = this.resolveId(role);
    if (!id) throw new TypeError("INVALID_TYPE");
    await this.client.api.delete(`/servers/${this.server.id}/roles/${id}`);
  }
}
