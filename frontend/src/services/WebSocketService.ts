// src/services/WebSocketService.ts
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private connectionPromise: Promise<void> | null = null;
  private onConnectCallback: (() => void) | null = null;

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private initClient() {
    const token = this.getToken();
    this.client = new Client({
      // Dùng native WebSocket — không cần sockjs-client
      brokerURL: 'ws://localhost:8080/ws-chat/websocket',
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('[WS] Connected');
        this.connectionPromise = null;
        if (this.onConnectCallback) {
          this.onConnectCallback();
          this.onConnectCallback = null;
        }
      },
      onDisconnect: () => {
        console.log('[WS] Disconnected');
      },
      onStompError: (frame) => {
        console.error('[WS] STOMP Error:', frame.headers['message']);
      },
      onWebSocketError: (event) => {
        console.error('[WS] WebSocket Error:', event);
      },
    });
  }

  /** Connect and optionally call a callback when ready */
  connect(onConnected?: () => void) {
    if (this.client?.connected) {
      onConnected?.();
      return;
    }
    this.onConnectCallback = onConnected ?? null;
    if (!this.client) this.initClient();
    this.client!.activate();
  }

  /** Ensure connected before performing any action */
  async ensureConnected(): Promise<void> {
    if (this.client?.connected) return;

    if (!this.connectionPromise) {
      this.connectionPromise = new Promise((resolve) => {
        if (!this.client) this.initClient();

        const prevOnConnect = this.client!.onConnect;
        this.client!.onConnect = (frame) => {
          if (prevOnConnect) prevOnConnect.call(this.client, frame);
          this.connectionPromise = null;
          resolve();
        };

        if (!this.client!.active) {
          this.client!.activate();
        }
      });
    }
    return this.connectionPromise;
  }

  async subscribe(
    destination: string,
    callback: (data: any) => void
  ): Promise<StompSubscription | null> {
    try {
      await this.ensureConnected();
      // Unsubscribe existing if any
      if (this.subscriptions.has(destination)) {
        this.subscriptions.get(destination)?.unsubscribe();
      }
      const subscription = this.client!.subscribe(
        destination,
        (msg: IMessage) => {
          try {
            const data = JSON.parse(msg.body);
            callback(data);
          } catch (e) {
            console.error('[WS] Parse error', e);
          }
        }
      );
      this.subscriptions.set(destination, subscription);
      return subscription;
    } catch (e) {
      console.error('[WS] Subscribe error', e);
      return null;
    }
  }

  async publish(destination: string, body: any) {
    await this.ensureConnected();
    this.client!.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  // ─── Business methods ──────────────────────────────────────────────────────

  async subscribeToRoom(roomId: number, callback: (message: any) => void) {
    return this.subscribe(`/topic/rooms/${roomId}`, callback);
  }

  async subscribeToNewRooms(_userId: number, callback: (room: any) => void) {
    return this.subscribe(`/user/queue/rooms`, callback);
  }

  async subscribeToTyping(
    roomId: number,
    callback: (indicator: any) => void
  ) {
    return this.subscribe(`/topic/rooms/${roomId}/typing`, callback);
  }

  async subscribeToReadReceipts(
    roomId: number,
    callback: (receipt: any) => void
  ) {
    return this.subscribe(`/topic/rooms/${roomId}/read-receipts`, callback);
  }

  async subscribeToUserStatus(
    roomId: number,
    callback: (status: any) => void
  ) {
    return this.subscribe(`/topic/rooms/${roomId}/users/status`, callback);
  }

  async sendMessage(
    roomId: number,
    message: {
      messageType: string;
      content?: string;
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
      metadata?: any;
    }
  ) {
    await this.publish('/app/chat.send', { roomId, ...message });
  }

  async sendTypingIndicator(roomId: number, isTyping: boolean) {
    await this.publish('/app/chat.typing', { roomId, isTyping });
  }

  async markAsRead(roomId: number, lastReadMessageId: number) {
    await this.publish('/app/chat.read', { roomId, lastReadMessageId });
  }

  unsubscribe(destination: string) {
    this.subscriptions.get(destination)?.unsubscribe();
    this.subscriptions.delete(destination);
  }

  disconnect() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.clear();
    this.client?.deactivate();
    this.client = null;
    this.connectionPromise = null;
  }
}

export const websocketService = new WebSocketService();
