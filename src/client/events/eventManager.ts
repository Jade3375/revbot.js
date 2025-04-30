import * as Events from "./index";
import { Event as CustomEvent } from "./event";
import type { client } from "../client";

/**
 * Manages the registration and retrieval of events for the client.
 */
export class EventManager {
  /** A map of registered events, keyed by their names. */
  #events = new Map<string, CustomEvent>();

  /**
   * Creates a new EventManager instance.
   *
   * @param {client} client - The client instance.
   */
  constructor(protected readonly client: client) {
    for (const Event of Object.values(Events)) {
      this.register(Event as new (client: client) => CustomEvent);
    }
  }

  /**
   * Registers an event with the manager.
   *
   * @param {new (client: client) => CustomEvent} Event - The event class to register.
   */
  register(Event: new (client: client) => CustomEvent): void {
    this.#events.set(Event.name.replace(/Events$/, ""), new Event(this.client));
  }

  /**
   * Retrieves a registered event by its name.
   *
   * @param {string} name - The name of the event to retrieve.
   * @returns {CustomEvent | null} The event instance, or `null` if not found.
   */
  get(name: string): CustomEvent | null {
    return this.#events.get(name) ?? null;
  }
}
