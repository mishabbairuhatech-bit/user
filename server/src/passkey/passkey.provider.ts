import { REPOSITORY } from '../common/constants/app.constants';
import { Passkey } from './entities/passkey.entity';

export const passkeyProviders = [
  {
    provide: REPOSITORY.PASSKEYS,
    useValue: Passkey,
  },
];
