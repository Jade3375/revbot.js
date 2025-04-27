import { ChannelManager, ServerManager } from "../managers";
import { UserManager } from "../managers/userManager";
import { ClientUser } from "../struct/clientUser";
import { BaseClient } from "./baseClient";
import { EventManager } from "./events/eventManager";
import { WebSocketClient } from "./webSocket";

export class client extends BaseClient {
  protected readonly ws = new WebSocketClient(this);
  readonly channels = new ChannelManager(this);
  readonly servers = new ServerManager(this);
  readonly users = new UserManager(this);
  readonly events = new EventManager(this);

  user: ClientUser | null = null;
  readyAt: Date | null = null;

  get readyTimestamp(): number | null {
    return this.readyAt ? this.readyAt.getTime() : null;
  }

  get upTime(): number | null {
    return this.readyAt ? Date.now() - this.readyAt.getTime() : null;
  }

  async login(token: string): Promise<void> {
    if (!token) throw new Error("Token is required");

    this.token = token;

    this.debug("Logging in...");
    try {
      await this.ws.connect();
    } catch (error) {
      this.debug(`Error connecting to WebSocket: ${error}`);
      throw error;
    }

    this.readyAt = new Date();
  }

  async destroy(): Promise<void> {
    this.token = null;
    this.user = null;
    this.readyAt = null;
    await this.ws.destroy();
  }

  isReady(): boolean {
    return this.readyAt !== null;
  }
}
