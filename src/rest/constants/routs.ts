export const API_BASE_URL = "https://api.revolt.chat";

export const routes = {
  core: {
    queryNode: {
      method: "GET",
      url: () => `${API_BASE_URL}/`,
    },
  },
  users: {
    fetchSelf: {
      method: "GET",
      url: () => `${API_BASE_URL}/users/@me`,
    },
    fetchUser: {
      method: "GET",
      url: (target: string) => `${API_BASE_URL}/users/${target}`,
    },
    editUser: {
      method: "PATCH",
      url: (target: string) => `${API_BASE_URL}/users/${target}`,
      body: (data: {
        display_name?: string;
        avatar?: string;
        status?: object;
        profile?: object;
        badges?: number;
        flags?: number;
        remove?: string[];
      }) => data,
    },
    fetchUserFlags: {
      method: "GET",
      url: (target: string) => `${API_BASE_URL}/users/${target}/flags`,
    },
    fetchDefaultAvatar: {
      method: "GET",
      url: (target: string) => `${API_BASE_URL}/users/${target}/default_avatar`,
    },
    fetchUserProfile: {
      method: "GET",
      url: (target: string) => `${API_BASE_URL}/users/${target}/profile`,
    },
    fetchDMs: {
      method: "GET",
      url: () => `${API_BASE_URL}/users/dms`,
    },
    openDM: {
      method: "GET",
      url: (target: string) => `${API_BASE_URL}/users/${target}/dm`,
    },
  },
  channels: {
    fetchChannel: {
      method: "GET",
      url: (target: string) => `${API_BASE_URL}/channels/${target}`,
    },
    closeChannel: {
      method: "DELETE",
      url: (target: string) => `${API_BASE_URL}/channels/${target}`,
    },
    editChannel: {
      method: "PATCH",
      url: (target: string) => `${API_BASE_URL}/channels/${target}`,
      body: (data: {
        name?: string;
        description?: string;
        owner?: string;
        icon?: string;
        nsfw?: boolean;
        archived?: boolean;
        remove?: string[];
      }) => data,
    },
    sendMessage: {
      method: "POST",
      url: (target: string) => `${API_BASE_URL}/channels/${target}/messages`,
      body: (data: {
        content?: string;
        attachments?: string[];
        replies?: object[];
        embeds?: object[];
        masquerade?: object;
        interactions?: object;
        flags?: number;
      }) => data,
    },
    editMessage: {
      method: "PATCH",
      url: (target: string, msg: string) =>
        `${API_BASE_URL}/channels/${target}/messages/${msg}`,
      body: (data: { content?: string; embeds?: object[] }) => data,
    },
    bulkDeleteMessages: {
      method: "DELETE",
      url: (target: string) =>
        `${API_BASE_URL}/channels/${target}/messages/bulk`,
      body: (data: { ids: string[] }) => data,
    },
    joinCall: {
      method: "POST",
      url: (target: string) => `${API_BASE_URL}/channels/${target}/join_call`,
    },
    createInvite: {
      method: "POST",
      url: (target: string) => `${API_BASE_URL}/channels/${target}/invites`,
    },
    createWebhook: {
      method: "POST",
      url: (target: string) => `${API_BASE_URL}/channels/${target}/webhooks`,
      body: (data: { name: string; avatar?: string }) => data,
    },
  },
  servers: {
    fetchServer: {
      method: "GET",
      url: (target: string) => `${API_BASE_URL}/servers/${target}`,
    },
    editServer: {
      method: "PATCH",
      url: (target: string) => `${API_BASE_URL}/servers/${target}`,
      body: (data: {
        name?: string;
        description?: string;
        icon?: string;
        banner?: string;
        categories?: object[];
        system_messages?: object;
        flags?: number;
        discoverable?: boolean;
        analytics?: boolean;
        remove?: string[];
      }) => data,
    },
    createChannel: {
      method: "POST",
      url: (server: string) => `${API_BASE_URL}/servers/${server}/channels`,
      body: (data: {
        name: string;
        description?: string;
        type?: string;
        nsfw?: boolean;
      }) => data,
    },
    fetchMembers: {
      method: "GET",
      url: (target: string) => `${API_BASE_URL}/servers/${target}/members`,
    },
    fetchMember: {
      method: "GET",
      url: (target: string, member: string) =>
        `${API_BASE_URL}/servers/${target}/members/${member}`,
    },
    editMember: {
      method: "PATCH",
      url: (server: string, member: string) =>
        `${API_BASE_URL}/servers/${server}/members/${member}`,
      body: (data: {
        nickname?: string;
        avatar?: string;
        roles?: string[];
        timeout?: string;
        remove?: string[];
      }) => data,
    },
    kickMember: {
      method: "DELETE",
      url: (target: string, member: string) =>
        `${API_BASE_URL}/servers/${target}/members/${member}`,
    },
    banUser: {
      method: "PUT",
      url: (server: string, target: string) =>
        `${API_BASE_URL}/servers/${server}/bans/${target}`,
      body: (data: { reason?: string }) => data,
    },
    unbanUser: {
      method: "DELETE",
      url: (server: string, target: string) =>
        `${API_BASE_URL}/servers/${server}/bans/${target}`,
    },
    fetchBans: {
      method: "GET",
      url: (target: string) => `${API_BASE_URL}/servers/${target}/bans`,
    },
    createRole: {
      method: "POST",
      url: (target: string) => `${API_BASE_URL}/servers/${target}/roles`,
      body: (data: { name: string; rank?: number }) => data,
    },
    editRole: {
      method: "PATCH",
      url: (target: string, roleId: string) =>
        `${API_BASE_URL}/servers/${target}/roles/${roleId}`,
      body: (data: {
        name?: string;
        colour?: string;
        hoist?: boolean;
        rank?: number;
        remove?: string[];
      }) => data,
    },
    deleteRole: {
      method: "DELETE",
      url: (target: string, roleId: string) =>
        `${API_BASE_URL}/servers/${target}/roles/${roleId}`,
    },
  },
};
