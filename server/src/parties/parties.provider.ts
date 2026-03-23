import { REPOSITORY } from '../common/constants/app.constants';
import { Party } from './entities/party.entity';

export const partiesProviders = [
  { provide: REPOSITORY.PARTIES, useValue: Party },
];
