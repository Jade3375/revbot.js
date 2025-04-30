import { Event, API, Events } from "./event";

/**
 * Represents the event handler for user updates.
 *
 * @extends Event
 */
export class UserUpdate extends Event {
  /**
   * Handles the user update event.
   *
   * @param {{ id: string; data: API.User; clear: API.FieldsUser[] }} data - The data for the event, containing the user ID, updated user data, and fields to clear.
   * @returns {void}
   */
  handle(data: { id: string; data: API.User; clear: API.FieldsUser[] }): void {
    const user =
      data.id === this.client.user!.id
        ? this.client.user
        : this.client.users.cache.get(data.id);
    const oldUser = user?._update(data.data, data.clear);

    if (user && oldUser && !user.equals(oldUser)) {
      this.client.emit(Events.USER_UPDATE, oldUser, user);
    }
  }
}
