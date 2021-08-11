import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ContactInfoDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  message: string;
}
