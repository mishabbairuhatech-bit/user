import { REPOSITORY } from '../common/constants/app.constants';
import { PosTerminal } from './entities/pos-terminal.entity';
import { PosSession } from './entities/pos-session.entity';
import { HeldBill } from './entities/held-bill.entity';

export const posProviders = [
  { provide: REPOSITORY.POS_TERMINALS, useValue: PosTerminal },
  { provide: REPOSITORY.POS_SESSIONS, useValue: PosSession },
  { provide: REPOSITORY.HELD_BILLS, useValue: HeldBill },
];
