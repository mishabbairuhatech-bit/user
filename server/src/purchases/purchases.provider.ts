import { REPOSITORY } from '../common/constants/app.constants';
import { PurchaseBill } from './entities/purchase-bill.entity';
import { PurchaseBillItem } from './entities/purchase-bill-item.entity';
import { DebitNote } from './entities/debit-note.entity';
import { DebitNoteItem } from './entities/debit-note-item.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';

export const purchasesProviders = [
  { provide: REPOSITORY.PURCHASE_BILLS, useValue: PurchaseBill },
  { provide: REPOSITORY.PURCHASE_BILL_ITEMS, useValue: PurchaseBillItem },
  { provide: REPOSITORY.DEBIT_NOTES, useValue: DebitNote },
  { provide: REPOSITORY.DEBIT_NOTE_ITEMS, useValue: DebitNoteItem },
  { provide: REPOSITORY.PURCHASE_ORDERS, useValue: PurchaseOrder },
  { provide: REPOSITORY.PURCHASE_ORDER_ITEMS, useValue: PurchaseOrderItem },
];
