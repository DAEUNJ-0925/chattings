import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';
import { Types, Document } from 'mongoose';
import { Socket as SocketModel } from './sockets.model';

const options: SchemaOptions = {
  collection: 'chattings', // db의 이름을 설정해줌 ( 설정 안하면 createForClass(Chatting)에서 이름을 소문자로만들고 's'를 붙여 생성 )
  timestamps: true, // 언제 db가 만들어지고, 수정되는지를 찍어줌
};

@Schema(options)
export class Chatting extends Document {
  @Prop({
    type: {
      _id: { type: Types.ObjectId, required: true, ref: 'sockets' }, // _id: Types.ObjectId는 소켓 생성시 자동으로 만들어지는 유니크한 id, ref socket : sockets model을 참조한다는 뜻
      id: { type: String },
      username: { type: String, required: true },
    },
  })
  @IsNotEmpty()
  @IsString()
  user: SocketModel;

  @Prop({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  chat: string;
}

export const ChattingSchema = SchemaFactory.createForClass(Chatting);
