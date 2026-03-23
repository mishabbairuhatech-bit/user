import { Controller, Get, Post, Put, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PartiesService } from './parties.service';
import { CreatePartyDto } from './dto/create-party.dto';
import { UpdatePartyDto } from './dto/update-party.dto';
import { PartyQueryDto } from './dto/party-query.dto';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { UserById } from '../common/decorators/user-by-id.decorator';

@ApiTags('Parties')
@ApiBearerAuth('access-token')
@Controller('parties')
export class PartiesController {
  constructor(private readonly partiesService: PartiesService) {}

  @Post()
  @RequirePermissions('sales:create')
  @ApiOperation({ summary: 'Create a customer or vendor' })
  async createParty(@Body() dto: CreatePartyDto, @UserById() userId: string) {
    return this.partiesService.createParty(dto, userId);
  }

  @Get()
  @RequirePermissions('sales:read')
  @ApiOperation({ summary: 'List parties with optional type filter' })
  async getParties(@Query() query: PartyQueryDto) {
    return this.partiesService.getParties(query);
  }

  @Get(':id')
  @RequirePermissions('sales:read')
  @ApiOperation({ summary: 'Get party detail' })
  async getParty(@Param('id', ParseUUIDPipe) id: string) {
    return this.partiesService.getParty(id);
  }

  @Put(':id')
  @RequirePermissions('sales:update')
  @ApiOperation({ summary: 'Update a party' })
  async updateParty(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePartyDto) {
    return this.partiesService.updateParty(id, dto);
  }

  @Get(':id/statement')
  @RequirePermissions('accounting:read')
  @ApiOperation({ summary: 'Get party account statement' })
  async getPartyStatement(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('from_date') fromDate?: string,
    @Query('to_date') toDate?: string,
  ) {
    return this.partiesService.getPartyStatement(id, fromDate, toDate);
  }
}
