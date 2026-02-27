import { REPOSITORY } from '../common/constants/app.constants';
import { PasswordHistory } from './entities/password-history.entity';

export const passwordHistoryProviders = [
  {
    provide: REPOSITORY.PASSWORD_HISTORIES,
    useValue: PasswordHistory,
  },
];
