import { MessageType, MessageTypeNames } from './types';
import { Messages, parsePacketHeader, PB } from './codec';
import type { ConnectionStatus, ConnectConfig, MumbleChannel, MumbleUser, ChatMessage } from './types';

type EventCallback = (...args: any[]) => void;

class MumbleClient {
  private ws: WebSocket | null = null;
  private status: ConnectionStatus = 'disconnected';
  private listeners: Map<string, EventCallback[]> = new Map();
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private session: number | null = null;
  private config: ConnectConfig | null = null;

  getStatus(): ConnectionStatus { return this.status; }
  getSession(): number | null { return this.session; }
  isConnected(): boolean { return this.status === 'connected'; }

  on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(callback);
    return () => {
      const list = this.listeners.get(event);
      if (list) {
        const idx = list.indexOf(callback);
        if (idx >= 0) list.splice(idx, 1);
      }
    };
  }

  private emit(event: string, ...args: any[]): void {
    const list = this.listeners.get(event);
    if (list) list.forEach(cb => { try { cb(...args); } catch (e) { console.error(e); } });
  }

  async connect(config: ConnectConfig): Promise<void> {
    if (this.ws) await this.disconnect();
    this.config = config;
    const url = config.proxyUrl || `ws://${window.location.hostname}:64737`;
    this.setStatus('connecting');

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);
        this.ws.binaryType = 'arraybuffer';
      } catch (e) {
        this.setStatus('error');
        reject(e);
        return;
      }

      this.ws.onopen = () => {
        this.sendRaw(Messages.version());
        resolve();
      };
      this.ws.onmessage = (e: MessageEvent) => {
        if (e.data instanceof ArrayBuffer) {
          this.handleMessage(new Uint8Array(e.data));
        }
      };
      this.ws.onclose = () => {
        this.cleanup();
        this.setStatus('disconnected');
        this.emit('disconnected');
      };
      this.ws.onerror = () => {
        this.setStatus('error');
        this.emit('error', 'WebSocket error');
        reject(new Error('Connection failed'));
      };
    });
  }

  async disconnect(): Promise<void> {
    this.cleanup();
    if (this.ws) { this.ws.close(); this.ws = null; }
    this.session = null;
    this.setStatus('disconnected');
    this.emit('disconnected');
  }

  private cleanup(): void {
    if (this.pingInterval) { clearInterval(this.pingInterval); this.pingInterval = null; }
  }

  private setStatus(s: ConnectionStatus): void {
    this.status = s;
    this.emit('statusChange', s);
  }

  private handleMessage(data: Uint8Array): void {
    if (data.length < 6) return;
    const [typeId, length, payload] = parsePacketHeader(data);
    const p = PB.parse(payload);

    switch (typeId) {
      case MessageType.Version:
        this.emit('version', p);
        if (this.config) {
          this.sendRaw(Messages.authenticate(this.config.username, this.config.password));
        }
        break;
      case MessageType.Reject:
        this.setStatus('error');
        this.emit('reject', p[2] || 'unknown');
        break;
      case MessageType.ServerSync:
        this.session = p[1] ?? null;
        this.setStatus('connected');
        this.emit('connected', { session: p[1], welcomeText: p[3], maxBandwidth: p[2] });
        this.pingInterval = setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) this.sendRaw(Messages.ping());
        }, 5000);
        break;
      case MessageType.ChannelState:
        if (p[1] !== undefined) {
          const ch: MumbleChannel = { id: p[1], parent: p[2], name: p[3] || '(unnamed)', position: p[9] || 0 };
          this.emit('channelState', ch);
        }
        break;
      case MessageType.ChannelRemove:
        this.emit('channelRemove', p[1]);
        break;
      case MessageType.UserState: {
        if (p[1] !== undefined) {
          const user: MumbleUser = {
            session: p[1],
            name: p[3] || `#${p[1]}`,
            userId: p[4],
            channelId: p[5] ?? 0,
            mute: !!p[6], deaf: !!p[7], suppress: !!p[8],
            selfMute: !!p[9], selfDeaf: !!p[10],
          };
          this.emit('userState', user);
        }
        break;
      }
      case MessageType.UserRemove:
        this.emit('userRemove', p[1]);
        break;
      case MessageType.TextMessage:
        if (p[5]) {
          const msg: ChatMessage = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            actor: p[1] || 0,
            actorName: '',
            message: p[5],
            timestamp: Date.now(),
          };
          this.emit('textMessage', msg);
        }
        break;
      case MessageType.CryptSetup:
        this.emit('cryptSetup', p);
        break;
      case MessageType.CodecVersion:
        this.emit('codecVersion', { opus: p[4] });
        break;
      case MessageType.ServerConfig:
        this.emit('serverConfig', { maxUsers: p[6], allowHtml: p[3], messageLength: p[4] });
        break;
      case MessageType.Ping:
        this.emit('ping');
        break;
      default:
        this.emit('rawMessage', typeId, MessageTypeNames[typeId] || `#${typeId}`, payload);
    }
  }

  sendRaw(data: Uint8Array): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(data);
      return true;
    }
    return false;
  }

  sendTextMessage(message: string, channelId?: number): boolean {
    return this.sendRaw(Messages.textMessage(message, channelId));
  }

  moveToChannel(channelId: number): boolean {
    return this.sendRaw(Messages.userState(channelId));
  }

  setSelfMute(mute: boolean): boolean {
    return this.sendRaw(Messages.userState(undefined, mute));
  }

  setSelfDeaf(deaf: boolean): boolean {
    return this.sendRaw(Messages.userState(undefined, undefined, deaf));
  }
}

let client: MumbleClient | null = null;
export function getClient(): MumbleClient {
  if (!client) client = new MumbleClient();
  return client;
}
export { MumbleClient };
