import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContactInfoDto } from './dto/contact-info.dto';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendMail(contactInfo: ContactInfoDto) {
    const { title, email, message } = contactInfo;
    await this.mailerService.sendMail({
      to: this.configService.get('EMAIL_TO'),
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'You received a new contact message!',
      template: './newMessage', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        title: title,
        message: message,
        email: email,
      },
    });
  }
}
