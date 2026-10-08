import { ClientMessage, SanitizedRoomState, ServerMessage } from '../types/game';

type StateListener = (state: SanitizedRoomState) => void;
type ErrorListener = (message: string) => void;
type NotificationListener = (message: string, variant?: 'info' | 'success' | 'warning') => void;
type PowerListener = (msg: Extract<ServerMessage, { type: 'POWER_ACTIVATED' }>) => void;
type ConnectionListener = (connected: boolean) => void;

class GameSocketService {
  private ws: WebSocket | null = null;
  private stateListeners = new Set<StateListener>();
  private errorListeners = new Set<ErrorListener>();
  private notificationListeners = new Set<NotificationListener>();
  private powerListeners = new Set<PowerListener>();
  private connectionListeners = new Set<ConnectionListener>();

  public isConnected = false;
  public myPlayerId: string | null = null;
  public roomCode: string | null = null;
  public sessionToken: string | null = null;

  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionallyClosed = false;

  constructor() {
    // Restore session credentials from localStorage if present
    const savedToken = localStorage.getItem('guardioes_session_token');
    const savedRoom = localStorage.getItem('guardioes_room_code');
    const savedPid = localStorage.getItem('guardioes_player_id');
    if (savedToken && savedRoom && savedPid) {
      this.sessionToken = savedToken;
      this.roomCode = savedRoom;
      this.myPlayerId = savedPid;
    }
  }

  public connect(): Promise<void> {
    return new Promise((resolve) => {
      if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
        resolve();
        return;
      }

      this.intentionallyClosed = false;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.isConnected = true;
          this.notifyConnection(true);

          // If we had a prior session, attempt auto-reconnect
          if (this.sessionToken && this.roomCode) {
            this.send({
              type: 'JOIN_ROOM',
              roomCode: this.roomCode,
              nickname: localStorage.getItem('guardioes_nickname') || 'Guardião',
              characterId: (localStorage.getItem('guardioes_character') as any) || 'alex',
              variantIndex: Number(localStorage.getItem('guardioes_variant')) || 0,
              sessionToken: this.sessionToken,
            });
          }

          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data: ServerMessage = JSON.parse(event.data);
            this.handleServerMessage(data);
          } catch (err) {
            console.error('Failed to parse WS message:', err);
          }
        };

        this.ws.onerror = (err) => {
          console.warn('WebSocket error:', err);
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.notifyConnection(false);
          if (!this.intentionallyClosed) {
            this.scheduleReconnect();
          }
        };
      } catch (err) {
        console.error('WS init exception:', err);
        this.scheduleReconnect();
        resolve();
      }
    });
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.isConnected && !this.intentionallyClosed) {
        this.connect();
      }
    }, 2500);
  }

  public send(msg: ClientMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    } else {
      // Connect first then send
      this.connect().then(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify(msg));
        }
      });
    }
  }

  private handleServerMessage(msg: ServerMessage) {
    switch (msg.type) {
      case 'ROOM_JOINED':
        this.roomCode = msg.roomCode;
        this.myPlayerId = msg.playerId;
        this.sessionToken = msg.sessionToken;

        localStorage.setItem('guardioes_session_token', msg.sessionToken);
        localStorage.setItem('guardioes_room_code', msg.roomCode);
        localStorage.setItem('guardioes_player_id', msg.playerId);

        this.stateListeners.forEach((l) => l(msg.state));
        break;

      case 'STATE_UPDATE':
        this.stateListeners.forEach((l) => l(msg.state));
        break;

      case 'ERROR':
        this.errorListeners.forEach((l) => l(msg.message));
        break;

      case 'NOTIFICATION':
        this.notificationListeners.forEach((l) => l(msg.message, msg.variant));
        break;

      case 'POWER_ACTIVATED':
        this.powerListeners.forEach((l) => l(msg));
        break;
    }
  }

  public onState(cb: StateListener) {
    this.stateListeners.add(cb);
    return () => this.stateListeners.delete(cb);
  }

  public onError(cb: ErrorListener) {
    this.errorListeners.add(cb);
    return () => this.errorListeners.delete(cb);
  }

  public onNotification(cb: NotificationListener) {
    this.notificationListeners.add(cb);
    return () => this.notificationListeners.delete(cb);
  }

  public onPower(cb: PowerListener) {
    this.powerListeners.add(cb);
    return () => this.powerListeners.delete(cb);
  }

  public onConnection(cb: ConnectionListener) {
    this.connectionListeners.add(cb);
    return () => this.connectionListeners.delete(cb);
  }

  private notifyConnection(val: boolean) {
    this.connectionListeners.forEach((l) => l(val));
  }

  public leaveRoom() {
    this.intentionallyClosed = true;
    localStorage.removeItem('guardioes_session_token');
    localStorage.removeItem('guardioes_room_code');
    localStorage.removeItem('guardioes_player_id');
    this.roomCode = null;
    this.myPlayerId = null;
    this.sessionToken = null;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const socketService = new GameSocketService();
