import { Event, Events } from "./event";

export class BulkMessageDelete extends Event {
  handle(data: { ids: string[] }) {
    // TODO: Get cached messages
    this.client.emit(Events.MESSAGE_DELETE_BULK, data.ids);
  }
}
