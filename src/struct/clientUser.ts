import { NotesChannel, Status, User } from "./index";
import type { User as APIUser } from "revolt-api";
import { client } from "../client/client";
import { stat } from "node:fs";

/**
 * Represents the client user, which is the authenticated user or bot.
 *
 * @extends User
 */
export class ClientUser extends User {
  /** The notes channel associated with the client user, if any. */
  notes: NotesChannel | null = null;

  owner: string | null = null;

  constructor(client: client, data: APIUser) {
    super(client, data);
    this._patch(data);
    this.owner = data.bot?.owner || null;
  }
  /**
   * Updates the username of the client user.
   *
   * @param {string} username - The new username to set.
   * @param {string} [password] - The current password of the user (required for non-bot accounts).
   * @returns {Promise<void>} A promise that resolves when the username has been successfully updated.
   * @throws {Error} Throws an error if the client user is a bot and a password is provided.
   *
   * @example
   * ```typescript
   * await clientUser.setUsername("NewUsername", "CurrentPassword");
   * ```
   */
  async setUsername(username: string, password?: string): Promise<void> {
    if (this.bot && password) {
      throw new Error("Bots do not have passwords");
    }

    await this.client.api.patch("/users/@me/username", {
      body: { username, password },
    });
  }

  async setStatus(text?: string | null): Promise<void>;
  async setStatus(presence?: Status): Promise<void>;
  /**
   * Updates the status of the client user.
   *
   * @param {string | null} [text] - The status text to set, or `null` to clear the status.
   * @param {Status} [presence] - The presence status (e.g., online, idle, etc.).
   * @returns {Promise<void>} A promise that resolves when the status has been successfully updated.
   *
   * @example
   * ```typescript
   * await clientUser.setStatus("Available", "Online");
   * ```
   */
  async setStatus(
    text?: string | null,
    presence?: keyof typeof Status,
  ): Promise<void>;
  async setStatus(text?: unknown, presence?: unknown): Promise<void> {
    // If 'text' is a valid key of Status, treat it as presence
    if (typeof text === "string" && text in Status && !presence) {
      presence = text as keyof typeof Status;
      text = undefined;
    }
    const status = {
      text: text ?? this.client.user?.presence.text,
      presence: presence ?? this.client.user?.presence.status,
    };
    await this.client.api.patch(`/users/${this.client.user?.id}`, {
      body: { status: status },
    });
  }
}
