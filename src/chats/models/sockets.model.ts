import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';
import { Document } from 'mongoose';

const options: SchemaOptions = {
  id: false, // id와 _id(primarykey)를 다르게 한다 -> true 이면 _id === id
  collection: 'sockets',
  timestamps: true,
};

@Schema(options)
export class Socket extends Document {
  @Prop({
    unique: true,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  id: string;

  @Prop({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  username: string;
}

export const SocketSchema = SchemaFactory.createForClass(Socket);
