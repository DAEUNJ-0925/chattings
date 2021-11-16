import { Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { AppController } from './app.controller';
import { ChatsModule } from './chats/chats.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, //다른 모듈에서도 똑같이 .env파일 사용가능
    }),
    MongooseModule.forRoot(
      //'mongodb://id:pwd@localhost:27017/chattings',
      process.env.MONGODB_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    ),
    ChatsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure() {
    const DEBUG = process.env.MODE === 'dev' ? true : false;
    mongoose.set('debug', DEBUG);
  }
}
