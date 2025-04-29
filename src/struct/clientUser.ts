import { NotesChannel, Status, User } from "./index";

/**
 * Represents the client user, which is the authenticated user or bot.
 *
 * @extends User
 */
export class ClientUser extends User {
  /** The notes channel associated with the client user, if any. */
  notes: NotesChannel | null = null;

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

  /**
   * Updates the status of the client user.
   *
   * @param {string | null} text - The status text to set, or `null` to clear the status.
   * @param {Status} [presence] - The presence status (e.g., online, idle, etc.).
   * @returns {Promise<void>} A promise that resolves when the status has been successfully updated.
   *
   * @example
   * ```typescript
   * await clientUser.setStatus("Available", "online");
   * ```
   */
  async setStatus(text: string | null, presence?: Status): Promise<void> {
    await this.client.api.patch("/users/@me", {
      body: { status: { text, presence } },
    });
  }
}
