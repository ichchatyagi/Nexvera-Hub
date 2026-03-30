import { Controller, Post, Body } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async create(@Body() createContactDto: CreateContactDto) {
    return this.contactService.sendContact(createContactDto);
  }

  @Post('consultancy')
  async createConsultancy(@Body() createContactDto: CreateContactDto) {
    return this.contactService.sendConsultancy(createContactDto);
  }
}
