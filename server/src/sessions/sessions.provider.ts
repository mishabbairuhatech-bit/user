import { REPOSITORY } from '../common/constants/app.constants';
import { LoginSession } from './entities/login-session.entity';

export const sessionsProviders = [
  {
    provide: REPOSITORY.LOGIN_SESSIONS,
    useValue: LoginSession,
  },
];
