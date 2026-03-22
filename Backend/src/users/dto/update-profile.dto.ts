import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString()
  firstName?: string;

  @IsOptional() @IsString()
  lastName?: string;

  @IsOptional() @IsUrl()
  avatarUrl?: string;

  @IsOptional() @IsString()
  bio?: string;

  @IsOptional() @IsString()
  country?: string;

  @IsOptional() @IsString()
  timezone?: string;

  @IsOptional() @IsString()
  language?: string;

  @IsOptional() @IsString()
  phone?: string;
}
