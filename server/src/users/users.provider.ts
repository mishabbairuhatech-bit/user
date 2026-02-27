import { REPOSITORY } from '../common/constants/app.constants';
import { User } from './entities/user.entity';

export const usersProviders = [
  {
    provide: REPOSITORY.USERS,
    useValue: User,
  },
];
