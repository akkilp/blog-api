import {
  Body,
  Controller,
  HttpCode,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { forbidUnknownValues } from 'src/posts/util/forbidUnknownValues';
import { ContactInfoDto } from './dto/contact-info.dto';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @HttpCode(200)
  @Post()
  sendEmail(
    @Body(new ValidationPipe(forbidUnknownValues))
    contactInfo: ContactInfoDto,
  ) {
    return this.mailService.sendMail(contactInfo);
  }
}
