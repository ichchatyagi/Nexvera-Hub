import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class RegisterPushTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['android', 'ios'])
  platform: 'android' | 'ios';
}
