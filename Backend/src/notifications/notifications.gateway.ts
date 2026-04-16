import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../app-config/app-config.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/ws/notifications',
  cors: { origin: true, credentials: true },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly appConfig: AppConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.query.token as string;

      if (!token) {
        this.logger.debug('Disconnecting socket: No token provided');
        client.disconnect(true);
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.appConfig.jwtSecret,
      });

      const userId = payload.sub;
      if (!userId) {
        this.logger.debug('Disconnecting socket: Invalid payload sub');
        client.disconnect(true);
        return;
      }

      // Join user specific room
      await client.join(userId);
      this.logger.debug(`Client ${client.id} joined room ${userId}`);
    } catch (err) {
      this.logger.debug(`Disconnecting socket: JWT verification failed - ${err.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client ${client.id} disconnected`);
  }

  emitToUser(userId: string, event: string, payload: any) {
    this.server.to(userId).emit(event, payload);
  }
}
