import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Model } from 'mongoose';
import { Socket } from 'socket.io';
import { Chatting } from './models/chattings.model';
import { Socket as SocketModel } from './models/sockets.model';

@WebSocketGateway({ namespace: 'chattings' })
export class ChatsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  /*
  OnGatewayInit : 초기화되고 바로 실행될 인터페이스 -> afterInit
  OnGatewayConnection : 클라이언트와 연결이 되자마자 일어나는 인터페이스 -> handleConnection 구현
  OnGatewayDisconnect : 클라이언트와 연결이 끊기면 실행되는 인터페이스 -> handleDisconnect 구현
  */

  private logger = new Logger('chat');

  constructor(
    @InjectModel(Chatting.name) private readonly chattingModel: Model<Chatting>,
    @InjectModel(SocketModel.name)
    private readonly socketModel: Model<SocketModel>,
  ) {
    this.logger.log('constructor');
  }

  afterInit() {
    //OnGatewayInit의 메소드 : 게이트웨이가 실행될 때 constructor 제외하고 가장먼저 실행
    this.logger.log('init');
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`connected : ${socket.id}${socket.nsp.name}`); //nsp : namespace -> namespace.name = chattings
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const user = await this.socketModel.findOne({ id: socket.id });
    if (user) {
      //연결이 끊길 때, 소켓 내부에 해당 유저가 삭제되었음을 알려주기 위해 유저를 찾고 클라이언트로 보내줌
      socket.broadcast.emit('disconnect_user', user.username);
      await user.delete(); //유저 삭제
    }
    this.logger.log(`disconnected : ${socket.id}${socket.nsp.name}`);
  }

  //새로운 유저 접속
  @SubscribeMessage('new_user')
  async handleNewUser(
    @MessageBody() username: string,
    @ConnectedSocket() socket: Socket,
  ) {
    const exist = await this.socketModel.exists({ username }); //해당 필드에 존재여부를 알려줌
    if (exist) {
      //이미 소캣 내부에 존재하는 유저네임이라면 랜덤 숫자를 생성하여 임의로 유저네임 뒤에 붙여서 생성
      username = `${username}_${Math.floor(Math.random() * 100)}`;
      await this.socketModel.create({
        id: socket.id,
        username,
      });
    } else {
      await this.socketModel.create({
        id: socket.id,
        username,
      });
    }
    //console.log(username);
    //socket.emit('hello_user', 'hello ' + username);
    //username db에 적재 -> 브로드캐스팅 : 유저가 접속했다는 것을 (이미 접속한)유저(소켓)들이 알게끔 이벤트처리
    socket.broadcast.emit('user_connected', username);
    return username;
  }

  //채팅 전송
  @SubscribeMessage('submit_chat')
  async handleSubmitChat(
    @MessageBody() chat: string,
    @ConnectedSocket() socket: Socket,
  ) {
    const socketObj = await this.socketModel.findOne({ id: socket.id }); //소캣의 _id와 일치하는 유저를 찾는다

    await this.chattingModel.create({
      //해당 유저가 작성한 채팅을 db에 올린다.
      user: socketObj,
      chat,
    });
    //console.log(username);
    //socket.emit('hello_user', 'hello ' + username);
    //username db에 적재 -> 브로드캐스팅 : 유저가 접속했다는 것을 (이미 접속한)유저(소켓)들이 알게끔 이벤트처리
    socket.broadcast.emit('new_chat', {
      chat,
      username: socketObj.username,
    });
  }
}
