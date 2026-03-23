import { Injectable, Inject, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Op } from 'sequelize';
import { REPOSITORY } from '../common/constants/app.constants';
import { Party } from './entities/party.entity';
import { AccountingService } from '../accounting/accounting.service';
import { LedgerAccount } from '../accounting/entities/ledger-account.entity';
import { AccountGroup } from '../accounting/entities/account-group.entity';
import { CreatePartyDto } from './dto/create-party.dto';
import { UpdatePartyDto } from './dto/update-party.dto';
import { PartyQueryDto } from './dto/party-query.dto';
import { PaginatedResponseDto } from '../common/dto';

@Injectable()
export class PartiesService {
  constructor(
    @Inject(REPOSITORY.PARTIES)
    private readonly partyRepo: typeof Party,
    private readonly accountingService: AccountingService,
  ) {}

  async createParty(dto: CreatePartyDto, userId?: string): Promise<Party> {
    try {
      // Auto-create a ledger account for this party
      const groupName = dto.type === 'vendor' ? 'Sundry Creditors' : 'Sundry Debtors';
      const group = await AccountGroup.findOne({ where: { name: groupName } });

      let ledgerAccountId: string | undefined;
      if (group) {
        const ledger = await this.accountingService.createLedgerAccount({
          name: dto.name,
          group_id: group.id,
          opening_balance: dto.opening_balance || 0,
          opening_balance_type: dto.opening_balance_type || 'debit',
          description: `${dto.type === 'vendor' ? 'Vendor' : 'Customer'}: ${dto.name}`,
        }, userId);
        ledgerAccountId = ledger.id;
      }

      const party = await this.partyRepo.create({
        ...dto,
        ledger_account_id: ledgerAccountId,
        created_by: userId,
      } as any);

      return this.getParty(party.id);
    } catch (error) {
      console.error('PartiesService.createParty error:', error);
      throw new InternalServerErrorException('Failed to create party.');
    }
  }

  async getParties(query: PartyQueryDto): Promise<PaginatedResponseDto<Party>> {
    const where: any = { is_active: true };

    if (query.type) {
      where[Op.or] = [{ type: query.type }, { type: 'both' }];
    }

    if (query.search) {
      const search = `%${query.search}%`;
      where[Op.and] = [
        ...(where[Op.and] || []),
        {
          [Op.or]: [
            { name: { [Op.iLike]: search } },
            { gstin: { [Op.iLike]: search } },
            { phone: { [Op.iLike]: search } },
            { email: { [Op.iLike]: search } },
          ],
        },
      ];
    }

    const { rows, count } = await this.partyRepo.findAndCountAll({
      where,
      include: [{ model: LedgerAccount, attributes: ['id', 'name'] }],
      order: [[query.sort_by, query.sort_order]],
      limit: query.limit,
      offset: query.offset,
    });

    const totalPages = Math.ceil(count / query.limit);
    return {
      items: rows,
      meta: {
        total: count, page: query.page, limit: query.limit,
        total_pages: totalPages, has_next: query.page < totalPages, has_prev: query.page > 1,
      },
    };
  }

  async getParty(id: string): Promise<Party> {
    const party = await this.partyRepo.findByPk(id, {
      include: [{ model: LedgerAccount, attributes: ['id', 'name'] }],
    });
    if (!party) throw new NotFoundException('Party not found.');
    return party;
  }

  async updateParty(id: string, dto: UpdatePartyDto): Promise<Party> {
    const party = await this.partyRepo.findByPk(id);
    if (!party) throw new NotFoundException('Party not found.');

    // Update ledger account name if party name changes
    if (dto.name && dto.name !== party.name && party.ledger_account_id) {
      await this.accountingService.updateLedgerAccount(party.ledger_account_id, { name: dto.name });
    }

    await party.update(dto);
    return this.getParty(id);
  }

  async getPartyStatement(id: string, fromDate?: string, toDate?: string) {
    const party = await this.getParty(id);
    if (!party.ledger_account_id) return { party, statement: [] };
    return this.accountingService.getLedgerStatement(party.ledger_account_id, { from_date: fromDate, to_date: toDate });
  }
}
