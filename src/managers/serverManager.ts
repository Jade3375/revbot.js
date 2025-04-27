import { BaseManager } from "./baseManager";
import { Server } from "../struct/index";
import { UUID } from "../utils/index";
import { Server as APIServer } from "revolt-api";

export type ServerResolvable = Server | APIServer | string;

export interface EditServerOptions {
  name?: string;
  description?: string;
}

export class ServerManager extends BaseManager<Server, APIServer> {
  readonly holds = Server;

  _remove(id: string): void {
    const server = this.cache.get(id);

    for (const id of server?.channels.cache.keys() ?? []) {
      this.client.channels._remove(id);
    }

    return super._remove(id);
  }

  async edit(
    server: ServerResolvable,
    options: EditServerOptions,
  ): Promise<void> {
    const id = this.resolveId(server);
    if (!id) throw new TypeError("INVALID_TYPE");
    await this.client.api.patch(`/servers/${id}`, { body: options });
  }

  async ack(server: ServerResolvable): Promise<void> {
    const id = this.resolveId(server);
    if (!id) throw new TypeError("INVALID_TYPE");
    await this.client.api.put(`/servers/${id}/ack`);
  }

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
