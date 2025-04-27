import * as Events from "./index";
import { Event as CustomEvent } from "./event";
import type { client } from "../client";

export class EventManager {
  #events = new Map<string, CustomEvent>();

  constructor(protected readonly client: client) {
    for (const Event of Object.values(Events)) {
      this.register(Event as new (client: client) => CustomEvent);
    }
  }

  register(Event: new (client: client) => CustomEvent): void {
    this.#events.set(Event.name.replace(/Events$/, ""), new Event(this.client));
  }

  get(name: string): CustomEvent | null {
    return this.#events.get(name) ?? null;
  }
}
