export const MessageType = {
  Version: 0, UDPTunnel: 1, Authenticate: 2, Ping: 3, Reject: 4,
  ServerSync: 5, ChannelRemove: 6, ChannelState: 7, UserRemove: 8,
  UserState: 9, BanList: 10, TextMessage: 11, PermissionDenied: 12,
  ACL: 13, QueryUsers: 14, CryptSetup: 15, ContextActionModify: 16,
  ContextAction: 17, UserList: 18, VoiceTarget: 19, PermissionQuery: 20,
  CodecVersion: 21, UserStats: 22, RequestBlob: 23, ServerConfig: 24,
  SuggestConfig: 25, PluginDataTransmission: 26,
} as const;

export const MessageTypeNames: Record<number, string> = Object.fromEntries(
  Object.entries(MessageType).map(([k, v]) => [v, k])
);

// Mumble.proto field reference:
// UserState: session=1, actor=2, name=3, user_id=4, channel_id=5, mute=6, deaf=7, suppress=8, self_mute=9, self_deaf=10
// ChannelState: channel_id=1, parent=2, name=3, links=4, description=5, links_add=6, links_remove=7, temporary=8, position=9
// TextMessage: actor=1, session=2, channel_id=3, tree_id=4, message=5

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export interface MumbleChannel {
  id: number;
  parent?: number;
  name: string;
  description?: string;
  temporary?: boolean;
  position: number;
  maxUsers?: number;
}

export interface MumbleUser {
  session: number;
  name: string;
  userId?: number;
  channelId: number;
  mute?: boolean;
  deaf?: boolean;
  suppress?: boolean;
  selfMute?: boolean;
  selfDeaf?: boolean;
}

export interface ChatMessage {
  id: string;
  actor: number;
  actorName: string;
  message: string;
  timestamp: number;
}

export interface ServerInfo {
  welcomeText: string;
  maxBandwidth: number;
  allowHtml: boolean;
  maxUsers: number;
}

export interface ConnectConfig {
  host: string;
  port: number;
  proxyUrl: string;
  username: string;
  password: string;
}
