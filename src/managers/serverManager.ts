import { BaseManager } from "./baseManager";
import { Server } from "../struct/index";
import { Server as APIServer } from "revolt-api";

export type ServerResolvable = Server | APIServer | string;

export interface EditServerOptions {
  name?: string;
  description?: string;
}

export class ServerManager extends BaseManager<Server, APIServer> {
  /** @private */
  readonly holds = Server;

  /** @private */
  _remove(id: string): void {
    const server = this.cache.get(id);

    for (const id of server?.channels.cache.keys() ?? []) {
      this.client.channels._remove(id);
    }

    return super._remove(id);
  }

  /**
   * edits a server
   * @param server The server to edit
   * @param options The options to edit the server with
   * @param options.name The name of the server
   * @param options.description The description of the server
   * @returns A promise that resolves when the server is edited
   */
  async edit(
    server: ServerResolvable,
    options: EditServerOptions,
  ): Promise<void> {
    const id = this.resolveId(server);
    if (!id) throw new TypeError("INVALID_TYPE");
    await this.client.api.patch(`/servers/${id}`, { body: options });
  }

  /**
   * leaves a server
   * @param server the server to leave
   */
  async delete(server: ServerResolvable): Promise<void> {
    const id = this.resolveId(server);
    if (!id) throw new TypeError("INVALID_TYPE");
    await this.client.api.delete(`/servers/${id}`);
  }

  async fetch(
    server: ServerResolvable,
    { force = true } = {},
  ): Promise<Server> {
    const id = this.resolveId(server);

    if (!id) throw new TypeError("INVALID_TYPE");

    if (!force) {
      const server = this.cache.get(id);
      if (server) return server;
    }

    const data = await this.client.api.get(`/servers/${id}`);

    return this._add(data as APIServer);
  }
}
