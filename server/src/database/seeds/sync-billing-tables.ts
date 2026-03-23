/**
 * sync-billing-tables.ts
 *
 * One-time script to create all billing module tables.
 * Run with: npx ts-node -r tsconfig-paths/register src/database/seeds/sync-billing-tables.ts
 *
 * This uses Sequelize's sync({ alter: true }) which is safe for initial creation.
 * For production schema changes after data exists, use proper migrations instead.
 */
import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';
dotenv.config();

// Existing entities (needed for FK resolution — these tables already exist, won't be re-created)
import { User } from '../../users/entities/user.entity';
import { LoginSession } from '../../sessions/entities/login-session.entity';
import { PasswordHistory } from '../../password-history/entities/password-history.entity';
import { Passkey } from '../../passkey/entities/passkey.entity';
import { Role } from '../../roles/entities/role.entity';
import { Permission } from '../../roles/entities/permission.entity';
import { RolePermission } from '../../roles/entities/role-permission.entity';

// New billing entities
import { AccountGroup } from '../../accounting/entities/account-group.entity';
import { LedgerAccount } from '../../accounting/entities/ledger-account.entity';
import { JournalEntry } from '../../accounting/entities/journal-entry.entity';
import { JournalEntryLine } from '../../accounting/entities/journal-entry-line.entity';
import { FinancialYear } from '../../accounting/entities/financial-year.entity';
import { NumberSequence } from '../../accounting/entities/number-sequence.entity';
import { TaxRate } from '../../tax/entities/tax-rate.entity';
import { BusinessSettings } from '../../tax/entities/business-settings.entity';
import { Category } from '../../inventory/entities/category.entity';
import { Unit } from '../../inventory/entities/unit.entity';
import { HsnCode } from '../../inventory/entities/hsn-code.entity';
import { Product } from '../../inventory/entities/product.entity';
import { StockMovement } from '../../inventory/entities/stock-movement.entity';
import { StockAdjustment } from '../../inventory/entities/stock-adjustment.entity';
import { StockAdjustmentItem } from '../../inventory/entities/stock-adjustment-item.entity';
import { Party } from '../../parties/entities/party.entity';
import { BankAccount } from '../../banking/entities/bank-account.entity';
import { BankTransaction } from '../../banking/entities/bank-transaction.entity';
import { PaymentReceipt } from '../../banking/entities/payment-receipt.entity';
import { PaymentAllocation } from '../../banking/entities/payment-allocation.entity';
import { PurchaseBill } from '../../purchases/entities/purchase-bill.entity';
import { PurchaseBillItem } from '../../purchases/entities/purchase-bill-item.entity';
import { DebitNote } from '../../purchases/entities/debit-note.entity';
import { DebitNoteItem } from '../../purchases/entities/debit-note-item.entity';
import { PurchaseOrder } from '../../purchases/entities/purchase-order.entity';
import { PurchaseOrderItem } from '../../purchases/entities/purchase-order-item.entity';
import { SalesInvoice } from '../../sales/entities/sales-invoice.entity';
import { SalesInvoiceItem } from '../../sales/entities/sales-invoice-item.entity';
import { CreditNote } from '../../sales/entities/credit-note.entity';
import { CreditNoteItem } from '../../sales/entities/credit-note-item.entity';
import { Quotation } from '../../sales/entities/quotation.entity';
import { QuotationItem } from '../../sales/entities/quotation-item.entity';
import { PosTerminal } from '../../pos/entities/pos-terminal.entity';
import { PosSession } from '../../pos/entities/pos-session.entity';
import { HeldBill } from '../../pos/entities/held-bill.entity';

// Seed data
import {
  SEED_ACCOUNT_GROUPS,
  SEED_LEDGER_ACCOUNTS,
  SEED_TAX_RATES,
  SEED_UNITS,
} from './seed-data';

// Existing models must be registered for FK resolution but won't be synced
const EXISTING_MODELS = [
  User, LoginSession, PasswordHistory, Passkey, Role, Permission, RolePermission,
];

const BILLING_MODELS = [
  // Accounting (order matters for FK references)
  AccountGroup, LedgerAccount, FinancialYear, NumberSequence,
  JournalEntry, JournalEntryLine,
  // Tax
  TaxRate, BusinessSettings,
  // Inventory
  Category, Unit, HsnCode, Product, StockMovement,
  StockAdjustment, StockAdjustmentItem,
  // Parties
  Party,
  // Banking
  BankAccount, BankTransaction, PaymentReceipt, PaymentAllocation,
  // Purchases
  PurchaseBill, PurchaseBillItem, DebitNote, DebitNoteItem,
  PurchaseOrder, PurchaseOrderItem,
  // Sales
  SalesInvoice, SalesInvoiceItem, CreditNote, CreditNoteItem,
  Quotation, QuotationItem,
  // POS
  PosTerminal, PosSession, HeldBill,
];

async function syncBillingTables() {
  const useSsl = process.env.DB_SSL === 'true';
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'neondb',
    models: [...EXISTING_MODELS, ...BILLING_MODELS],
    logging: false,
    define: { timestamps: true, underscored: true },
    ...(useSsl
      ? { dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } }
      : {}),
  });

  try {
    await sequelize.authenticate();
    console.log('✓ Database connected.');

    // Sync only new billing tables (existing tables like users, roles are untouched)
    console.log('Syncing billing tables...');
    for (const model of BILLING_MODELS) {
      const tableName = (model as any).getTableName();
      try {
        await model.sync({ alter: true });
        console.log(`  ✓ ${tableName}`);
      } catch (err: any) {
        if (err?.parent?.code === '42701') {
          console.log(`  ✓ ${tableName} (columns already exist)`);
        } else {
          console.error(`  ✗ ${tableName}:`, err.message);
        }
      }
    }

    // Seed account groups
    console.log('\nSeeding account groups...');
    const groupMap = new Map<string, string>();
    for (const g of SEED_ACCOUNT_GROUPS) {
      const parentId = g.parent ? groupMap.get(g.parent) : null;
      const [group] = await AccountGroup.findOrCreate({
        where: { name: g.name },
        defaults: { name: g.name, nature: g.nature, parent_id: parentId, is_system: g.is_system, sequence: g.sequence } as any,
      });
      groupMap.set(g.name, group.id);
    }
    console.log(`  ✓ ${SEED_ACCOUNT_GROUPS.length} account groups`);

    // Seed system ledger accounts
    console.log('Seeding system ledger accounts...');
    for (const la of SEED_LEDGER_ACCOUNTS) {
      const groupId = groupMap.get(la.group);
      if (!groupId) { console.log(`  ⚠ Group "${la.group}" not found for "${la.name}"`); continue; }
      await LedgerAccount.findOrCreate({
        where: { name: la.name, is_system: true },
        defaults: { name: la.name, group_id: groupId, is_system: true, opening_balance: 0, opening_balance_type: 'debit' } as any,
      });
    }
    console.log(`  ✓ ${SEED_LEDGER_ACCOUNTS.length} system ledger accounts`);

    // Seed tax rates
    console.log('Seeding tax rates...');
    for (const tr of SEED_TAX_RATES) {
      await TaxRate.findOrCreate({
        where: { name: tr.name },
        defaults: tr as any,
      });
    }
    console.log(`  ✓ ${SEED_TAX_RATES.length} tax rates`);

    // Seed units
    console.log('Seeding units...');
    for (const u of SEED_UNITS) {
      await Unit.findOrCreate({
        where: { short_name: u.short_name },
        defaults: u as any,
      });
    }
    console.log(`  ✓ ${SEED_UNITS.length} units`);

    // Create default financial year
    const currentYear = new Date().getFullYear();
    const fyMonth = new Date().getMonth();
    const fyStartYear = fyMonth >= 3 ? currentYear : currentYear - 1;
    const fyName = `${fyStartYear}-${(fyStartYear + 1).toString().slice(2)}`;
    const [fy] = await FinancialYear.findOrCreate({
      where: { name: fyName },
      defaults: {
        name: fyName,
        start_date: `${fyStartYear}-04-01`,
        end_date: `${fyStartYear + 1}-03-31`,
        is_active: true,
      } as any,
    });
    console.log(`  ✓ Financial year: ${fyName}`);

    // Create number sequences for the FY
    const docTypes = [
      { type: 'sales_invoice', prefix: 'INV' },
      { type: 'purchase_bill', prefix: 'PB' },
      { type: 'credit_note', prefix: 'CN' },
      { type: 'debit_note', prefix: 'DN' },
      { type: 'payment', prefix: 'PMT' },
      { type: 'receipt', prefix: 'RCT' },
      { type: 'journal_entry', prefix: 'JE' },
      { type: 'quotation', prefix: 'QT' },
      { type: 'purchase_order', prefix: 'PO' },
      { type: 'stock_adjustment', prefix: 'ADJ' },
    ];
    for (const d of docTypes) {
      await NumberSequence.findOrCreate({
        where: { document_type: d.type, financial_year: fyName },
        defaults: { document_type: d.type, prefix: d.prefix, financial_year: fyName, last_number: 0 } as any,
      });
    }
    console.log(`  ✓ ${docTypes.length} number sequences`);

    // Create default POS terminal
    await PosTerminal.findOrCreate({
      where: { name: 'Counter 1' },
      defaults: { name: 'Counter 1', is_active: true } as any,
    });
    console.log('  ✓ Default POS terminal');

    // Create default business settings
    await BusinessSettings.findOrCreate({
      where: {},
      defaults: {
        business_name: 'My Business',
        invoice_prefix: 'INV',
        financial_year_start_month: 4,
        currency_code: 'INR',
        decimal_places: 2,
      } as any,
    });
    console.log('  ✓ Default business settings');

    console.log('\n✓ All billing tables synced and seeded successfully!');

    // Add performance indexes
    console.log('\nCreating performance indexes...');
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_ledger ON journal_entry_lines(ledger_account_id)',
      'CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_entry ON journal_entry_lines(journal_entry_id)',
      'CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date)',
      'CREATE INDEX IF NOT EXISTS idx_journal_entries_ref ON journal_entries(reference_type, reference_id)',
      'CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id)',
      'CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)',
      'CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode)',
      'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)',
      'CREATE INDEX IF NOT EXISTS idx_products_stock ON products(current_stock, minimum_stock)',
      'CREATE INDEX IF NOT EXISTS idx_sales_invoices_date ON sales_invoices(date)',
      'CREATE INDEX IF NOT EXISTS idx_sales_invoices_party ON sales_invoices(party_id)',
      'CREATE INDEX IF NOT EXISTS idx_sales_invoices_status ON sales_invoices(payment_status)',
      'CREATE INDEX IF NOT EXISTS idx_sales_invoices_source ON sales_invoices(source)',
      'CREATE INDEX IF NOT EXISTS idx_purchase_bills_date ON purchase_bills(date)',
      'CREATE INDEX IF NOT EXISTS idx_purchase_bills_party ON purchase_bills(party_id)',
      'CREATE INDEX IF NOT EXISTS idx_purchase_bills_status ON purchase_bills(payment_status)',
      'CREATE INDEX IF NOT EXISTS idx_parties_type ON parties(type)',
      'CREATE INDEX IF NOT EXISTS idx_parties_gstin ON parties(gstin)',
      'CREATE INDEX IF NOT EXISTS idx_bank_transactions_account ON bank_transactions(bank_account_id)',
      'CREATE INDEX IF NOT EXISTS idx_bank_transactions_reconciled ON bank_transactions(is_reconciled)',
      'CREATE INDEX IF NOT EXISTS idx_payment_receipts_party ON payment_receipts(party_id)',
      'CREATE INDEX IF NOT EXISTS idx_payment_receipts_type ON payment_receipts(type)',
      'CREATE INDEX IF NOT EXISTS idx_number_sequences_lookup ON number_sequences(document_type, financial_year)',
    ];

    for (const q of indexQueries) {
      try {
        await sequelize.query(q);
      } catch (err) {
        // Index might already exist
      }
    }
    console.log(`  ✓ ${indexQueries.length} performance indexes`);

    console.log('\n✓ Done!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Failed:', error);
    process.exit(1);
  }
}

syncBillingTables();
