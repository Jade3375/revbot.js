import { Event, API, Events } from "./event";

export class ServerUpdate extends Event {
  handle(data: {
    id: string;
    data: API.Server;
    clear: API.FieldsServer[];
  }): void {
    const server = this.client.servers.cache.get(data.id);
    const oldServer = server?._update(data.data, data.clear);

    if (oldServer && server && !oldServer.equals(server)) {
      this.client.emit(Events.SERVER_UPDATE, oldServer, server);
    }
  }
}
