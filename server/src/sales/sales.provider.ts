import { REPOSITORY } from '../common/constants/app.constants';
import { SalesInvoice } from './entities/sales-invoice.entity';
import { SalesInvoiceItem } from './entities/sales-invoice-item.entity';
import { CreditNote } from './entities/credit-note.entity';
import { CreditNoteItem } from './entities/credit-note-item.entity';
import { Quotation } from './entities/quotation.entity';
import { QuotationItem } from './entities/quotation-item.entity';

export const salesProviders = [
  { provide: REPOSITORY.SALES_INVOICES, useValue: SalesInvoice },
  { provide: REPOSITORY.SALES_INVOICE_ITEMS, useValue: SalesInvoiceItem },
  { provide: REPOSITORY.CREDIT_NOTES, useValue: CreditNote },
  { provide: REPOSITORY.CREDIT_NOTE_ITEMS, useValue: CreditNoteItem },
  { provide: REPOSITORY.QUOTATIONS, useValue: Quotation },
  { provide: REPOSITORY.QUOTATION_ITEMS, useValue: QuotationItem },
];
