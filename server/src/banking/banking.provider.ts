import { REPOSITORY } from '../common/constants/app.constants';
import { BankAccount } from './entities/bank-account.entity';
import { BankTransaction } from './entities/bank-transaction.entity';
import { PaymentReceipt } from './entities/payment-receipt.entity';
import { PaymentAllocation } from './entities/payment-allocation.entity';

export const bankingProviders = [
  { provide: REPOSITORY.BANK_ACCOUNTS, useValue: BankAccount },
  { provide: REPOSITORY.BANK_TRANSACTIONS, useValue: BankTransaction },
  { provide: REPOSITORY.PAYMENT_RECEIPTS, useValue: PaymentReceipt },
  { provide: REPOSITORY.PAYMENT_ALLOCATIONS, useValue: PaymentAllocation },
];
