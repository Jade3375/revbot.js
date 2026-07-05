import { Event, API, Events } from "./event";
import type { slowModeInfo } from "../../utils/types";

/**
 * Represents the event handler for user slowmode updates.
 * @private
 * @extends Event
 */
export class UserSlowmodes extends Event {
  /**
   * Handles the user slowmode update event.
   *
   * @param {slowModeInfo[]} data - The data for the event, containing slow mode information for the user.
   * @returns {void}
   */
  handle(data: { slowmodes: slowModeInfo[] }): void {
	this.client.emit(Events.USER_SLOWMODE_UPDATE, data.slowmodes);
  }
}
