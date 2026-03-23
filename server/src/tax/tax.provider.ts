import { REPOSITORY } from '../common/constants/app.constants';
import { TaxRate } from './entities/tax-rate.entity';
import { BusinessSettings } from './entities/business-settings.entity';

export const taxProviders = [
  { provide: REPOSITORY.TAX_RATES, useValue: TaxRate },
  { provide: REPOSITORY.BUSINESS_SETTINGS, useValue: BusinessSettings },
];
