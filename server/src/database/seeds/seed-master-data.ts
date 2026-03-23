/**
 * seed-master-data.ts
 *
 * Seeds all master data for the billing system:
 * - Roles & Permissions (with billing permissions)
 * - Sample HSN codes
 * - Sample categories
 * - Sample products
 * - Sample customers & vendors
 * - Default bank/cash accounts
 *
 * Run: npm run seed:master
 */
import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';
dotenv.config();

// Existing models
import { User } from '../../users/entities/user.entity';
import { LoginSession } from '../../sessions/entities/login-session.entity';
import { PasswordHistory } from '../../password-history/entities/password-history.entity';
import { Passkey } from '../../passkey/entities/passkey.entity';
import { Role } from '../../roles/entities/role.entity';
import { Permission } from '../../roles/entities/permission.entity';
import { RolePermission } from '../../roles/entities/role-permission.entity';

// Billing models
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

import { seedRolesAndPermissions } from './role-permission.seed';

const ALL_MODELS = [
  User, LoginSession, PasswordHistory, Passkey, Role, Permission, RolePermission,
  AccountGroup, LedgerAccount, FinancialYear, NumberSequence,
  JournalEntry, JournalEntryLine,
  TaxRate, BusinessSettings,
  Category, Unit, HsnCode, Product, StockMovement,
  StockAdjustment, StockAdjustmentItem,
  Party,
  BankAccount, BankTransaction, PaymentReceipt, PaymentAllocation,
  PurchaseBill, PurchaseBillItem, DebitNote, DebitNoteItem,
  PurchaseOrder, PurchaseOrderItem,
  SalesInvoice, SalesInvoiceItem, CreditNote, CreditNoteItem,
  Quotation, QuotationItem,
  PosTerminal, PosSession, HeldBill,
];

// ─── Sample HSN Codes ──────────────────────────

const SAMPLE_HSN_CODES = [
  { code: '84713010', description: 'Laptops and notebooks' },
  { code: '85171290', description: 'Mobile phones and smartphones' },
  { code: '84716060', description: 'Keyboard, mouse and other peripherals' },
  { code: '85044090', description: 'Power adapters and chargers' },
  { code: '49011010', description: 'Printed books and textbooks' },
  { code: '62034200', description: 'Mens trousers (cotton)' },
  { code: '62064000', description: 'Womens blouses and shirts' },
  { code: '64039990', description: 'Footwear with outer soles' },
  { code: '33049990', description: 'Beauty and skincare products' },
  { code: '04011000', description: 'Milk (not concentrated)' },
  { code: '10063090', description: 'Rice (semi-milled or milled)' },
  { code: '15079010', description: 'Soyabean oil (refined)' },
  { code: '22021090', description: 'Aerated / carbonated drinks' },
  { code: '30049099', description: 'Medicaments (other)' },
  { code: '94036000', description: 'Wooden furniture' },
  { code: '85287100', description: 'Television sets' },
  { code: '87032291', description: 'Motor cars (petrol, 1000-1500cc)' },
  { code: '73239390', description: 'Stainless steel utensils' },
];

// ─── Sample Categories ──────────────────────────

const SAMPLE_CATEGORIES = [
  { name: 'Electronics', children: ['Mobiles & Tablets', 'Computers & Laptops', 'Accessories'] },
  { name: 'Clothing', children: ['Mens Wear', 'Womens Wear', 'Kids Wear'] },
  { name: 'Groceries', children: ['Dairy', 'Grains & Pulses', 'Oils & Ghee', 'Beverages'] },
  { name: 'Home & Furniture', children: ['Living Room', 'Kitchen', 'Bedroom'] },
  { name: 'Health & Beauty', children: ['Medicines', 'Skincare', 'Personal Care'] },
  { name: 'Stationery', children: ['Books', 'Office Supplies'] },
];

// ─── Sample Products ──────────────────────────

const SAMPLE_PRODUCTS = [
  { name: 'Samsung Galaxy A15', sku: 'MOB-001', barcode: '8801234560001', category: 'Mobiles & Tablets', purchase_price: 10000, selling_price: 13999, stock: 25, tax: 'GST 18%', unit: 'PCS' },
  { name: 'iPhone 15 (128GB)', sku: 'MOB-002', barcode: '8801234560002', category: 'Mobiles & Tablets', purchase_price: 55000, selling_price: 69900, stock: 10, tax: 'GST 18%', unit: 'PCS' },
  { name: 'HP Laptop 15s', sku: 'LAP-001', barcode: '8801234560003', category: 'Computers & Laptops', purchase_price: 32000, selling_price: 42990, stock: 15, tax: 'GST 18%', unit: 'PCS' },
  { name: 'Wireless Mouse', sku: 'ACC-001', barcode: '8801234560004', category: 'Accessories', purchase_price: 250, selling_price: 499, stock: 100, tax: 'GST 18%', unit: 'PCS' },
  { name: 'USB-C Charger 65W', sku: 'ACC-002', barcode: '8801234560005', category: 'Accessories', purchase_price: 800, selling_price: 1499, stock: 50, tax: 'GST 18%', unit: 'PCS' },
  { name: 'Mens Cotton Shirt', sku: 'CLT-001', barcode: '8801234560006', category: 'Mens Wear', purchase_price: 400, selling_price: 799, stock: 200, tax: 'GST 5%', unit: 'PCS' },
  { name: 'Womens Kurti Set', sku: 'CLT-002', barcode: '8801234560007', category: 'Womens Wear', purchase_price: 500, selling_price: 999, stock: 150, tax: 'GST 5%', unit: 'PCS' },
  { name: 'Running Shoes (Men)', sku: 'SHO-001', barcode: '8801234560008', category: 'Mens Wear', purchase_price: 1200, selling_price: 2499, stock: 60, tax: 'GST 18%', unit: 'PR' },
  { name: 'Amul Taza Milk 500ml', sku: 'GRO-001', barcode: '8901234560009', category: 'Dairy', purchase_price: 22, selling_price: 25, stock: 500, tax: 'Exempt', unit: 'PCK' },
  { name: 'Basmati Rice 5kg', sku: 'GRO-002', barcode: '8901234560010', category: 'Grains & Pulses', purchase_price: 320, selling_price: 399, stock: 100, tax: 'GST 5%', unit: 'BAG' },
  { name: 'Fortune Soyabean Oil 1L', sku: 'GRO-003', barcode: '8901234560011', category: 'Oils & Ghee', purchase_price: 130, selling_price: 159, stock: 200, tax: 'GST 5%', unit: 'BTL' },
  { name: 'Coca Cola 750ml', sku: 'GRO-004', barcode: '8901234560012', category: 'Beverages', purchase_price: 30, selling_price: 40, stock: 300, tax: 'GST 28%', unit: 'BTL' },
  { name: 'Dolo 650 (Strip of 15)', sku: 'MED-001', barcode: '8901234560013', category: 'Medicines', purchase_price: 22, selling_price: 30, stock: 500, tax: 'GST 12%', unit: 'PCS' },
  { name: 'Nivea Face Cream 100ml', sku: 'BEA-001', barcode: '8901234560014', category: 'Skincare', purchase_price: 150, selling_price: 225, stock: 80, tax: 'GST 28%', unit: 'PCS' },
  { name: 'Wooden Study Table', sku: 'FUR-001', barcode: '8901234560015', category: 'Living Room', purchase_price: 3500, selling_price: 5999, stock: 20, tax: 'GST 18%', unit: 'PCS' },
  { name: 'Stainless Steel Kadai', sku: 'KIT-001', barcode: '8901234560016', category: 'Kitchen', purchase_price: 450, selling_price: 699, stock: 40, tax: 'GST 18%', unit: 'PCS' },
  { name: 'A4 Printer Paper (500)', sku: 'STN-001', barcode: '8901234560017', category: 'Office Supplies', purchase_price: 180, selling_price: 250, stock: 100, tax: 'GST 18%', unit: 'PCK' },
  { name: 'Ball Pen Blue (Pack 10)', sku: 'STN-002', barcode: '8901234560018', category: 'Office Supplies', purchase_price: 40, selling_price: 60, stock: 200, tax: 'GST 18%', unit: 'PCK' },
  { name: 'NCERT Physics Class 12', sku: 'BK-001', barcode: '8901234560019', category: 'Books', purchase_price: 80, selling_price: 120, stock: 50, tax: 'Exempt', unit: 'PCS' },
  { name: 'Samsung 43" Smart TV', sku: 'TV-001', barcode: '8901234560020', category: 'Electronics', purchase_price: 22000, selling_price: 29999, stock: 8, tax: 'GST 28%', unit: 'PCS' },
];

// ─── Sample Parties ──────────────────────────

const SAMPLE_CUSTOMERS = [
  { name: 'Rajesh Kumar', phone: '+919876543210', email: 'rajesh@example.com', gstin: '27AABCK1234A1Z5', state_code: '27', city: 'Mumbai', state: 'Maharashtra' },
  { name: 'Priya Sharma', phone: '+919876543211', email: 'priya@example.com', state_code: '07', city: 'New Delhi', state: 'Delhi' },
  { name: 'Tech Solutions Pvt Ltd', phone: '+919876543212', email: 'info@techsolutions.com', gstin: '27AABCT5678B1Z3', state_code: '27', city: 'Pune', state: 'Maharashtra' },
  { name: 'Anita Desai', phone: '+919876543213', email: 'anita@example.com', state_code: '29', city: 'Bangalore', state: 'Karnataka' },
  { name: 'Global Traders', phone: '+919876543214', email: 'global@traders.com', gstin: '29AABCG9012C1Z1', state_code: '29', city: 'Bangalore', state: 'Karnataka' },
];

const SAMPLE_VENDORS = [
  { name: 'Samsung India Electronics', phone: '+911234567890', email: 'b2b@samsung.in', gstin: '27AABCS1234D1Z7', state_code: '27', city: 'Mumbai', state: 'Maharashtra' },
  { name: 'Apple India Pvt Ltd', phone: '+911234567891', email: 'supply@apple.in', gstin: '07AABCA5678E1Z5', state_code: '07', city: 'Gurugram', state: 'Haryana' },
  { name: 'HP India Sales', phone: '+911234567892', email: 'sales@hp.in', gstin: '29AABCH9012F1Z3', state_code: '29', city: 'Bangalore', state: 'Karnataka' },
  { name: 'Wholesale Garments Hub', phone: '+911234567893', email: 'orders@wgh.com', gstin: '27AABCW3456G1Z1', state_code: '27', city: 'Mumbai', state: 'Maharashtra' },
  { name: 'Metro Cash & Carry', phone: '+911234567894', email: 'procurement@metro.in', gstin: '27AABCM7890H1Z9', state_code: '27', city: 'Navi Mumbai', state: 'Maharashtra' },
  { name: 'Stationery World Supplies', phone: '+911234567895', email: 'orders@statworld.com', gstin: '27AABCS2345I1Z7', state_code: '27', city: 'Thane', state: 'Maharashtra' },
];

// ─────────────────────────────────────────

async function seedMasterData() {
  const useSsl = process.env.DB_SSL === 'true';
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'neondb',
    models: ALL_MODELS,
    logging: false,
    define: { timestamps: true, underscored: true },
    ...(useSsl ? { dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } } : {}),
  });

  try {
    await sequelize.authenticate();
    console.log('✓ Database connected.\n');

    // ─── 1. Roles & Permissions ──────────────────
    console.log('═══ Roles & Permissions ═══');
    await seedRolesAndPermissions();
    console.log('');

    // ─── 2. HSN Codes ──────────────────
    console.log('═══ HSN Codes ═══');
    const taxRates = await TaxRate.findAll();
    const taxByName = new Map(taxRates.map((t) => [t.name, t]));
    const gst18 = taxByName.get('GST 18%');

    let hsnCreated = 0;
    for (const hsn of SAMPLE_HSN_CODES) {
      const [, created] = await HsnCode.findOrCreate({
        where: { code: hsn.code },
        defaults: { code: hsn.code, description: hsn.description, tax_rate_id: gst18?.id || null } as any,
      });
      if (created) hsnCreated++;
    }
    console.log(`  ✓ ${hsnCreated} HSN codes created (${SAMPLE_HSN_CODES.length - hsnCreated} already existed)`);

    // ─── 3. Categories ──────────────────
    console.log('\n═══ Categories ═══');
    let catCreated = 0;
    for (const cat of SAMPLE_CATEGORIES) {
      const [parent, parentCreated] = await Category.findOrCreate({
        where: { name: cat.name, parent_id: null },
        defaults: { name: cat.name } as any,
      });
      if (parentCreated) catCreated++;

      for (const childName of cat.children) {
        const [, childCreated] = await Category.findOrCreate({
          where: { name: childName, parent_id: parent.id },
          defaults: { name: childName, parent_id: parent.id } as any,
        });
        if (childCreated) catCreated++;
      }
    }
    console.log(`  ✓ ${catCreated} categories created`);

    // ─── 4. Products ──────────────────
    console.log('\n═══ Products ═══');
    const units = await Unit.findAll();
    const unitByShort = new Map(units.map((u) => [u.short_name, u]));
    const categories = await Category.findAll();
    const catByName = new Map(categories.map((c) => [c.name, c]));

    let prodCreated = 0;
    for (const p of SAMPLE_PRODUCTS) {
      const existing = await Product.findOne({ where: { sku: p.sku } });
      if (existing) continue;

      const taxRate = taxByName.get(p.tax);
      const category = catByName.get(p.category);
      const unit = unitByShort.get(p.unit);

      const product = await Product.create({
        name: p.name,
        sku: p.sku,
        barcode: p.barcode,
        category_id: category?.id || null,
        unit_id: unit?.id || null,
        tax_rate_id: taxRate?.id || null,
        purchase_price: p.purchase_price,
        selling_price: p.selling_price,
        minimum_stock: Math.ceil(p.stock * 0.2),
        opening_stock: p.stock,
        current_stock: p.stock,
      } as any);

      // Create opening stock movement
      await StockMovement.create({
        product_id: product.id,
        movement_type: 'opening',
        quantity: p.stock,
        reference_type: 'opening',
        reference_id: product.id,
        unit_cost: p.purchase_price,
        stock_before: 0,
        stock_after: p.stock,
        notes: 'Opening stock (seed)',
      } as any);

      prodCreated++;
    }
    console.log(`  ✓ ${prodCreated} products created with opening stock`);

    // ─── 5. Customers ──────────────────
    console.log('\n═══ Customers ═══');
    const debtorsGroup = await AccountGroup.findOne({ where: { name: 'Sundry Debtors' } });
    let custCreated = 0;

    for (const c of SAMPLE_CUSTOMERS) {
      const existing = await Party.findOne({ where: { name: c.name, type: 'customer' } });
      if (existing) continue;

      let ledgerAccountId: string | null = null;
      if (debtorsGroup) {
        const ledger = await LedgerAccount.create({
          name: c.name, group_id: debtorsGroup.id,
          opening_balance: 0, opening_balance_type: 'debit',
          description: `Customer: ${c.name}`,
        } as any);
        ledgerAccountId = ledger.id;
      }

      await Party.create({
        name: c.name, type: 'customer',
        phone: c.phone, email: c.email,
        gstin: c.gstin || null,
        state_code: c.state_code,
        billing_address: { city: c.city, state: c.state, state_code: c.state_code },
        ledger_account_id: ledgerAccountId,
      } as any);
      custCreated++;
    }
    console.log(`  ✓ ${custCreated} customers created with ledger accounts`);

    // ─── 6. Vendors ──────────────────
    console.log('\n═══ Vendors ═══');
    const creditorsGroup = await AccountGroup.findOne({ where: { name: 'Sundry Creditors' } });
    let vendCreated = 0;

    for (const v of SAMPLE_VENDORS) {
      const existing = await Party.findOne({ where: { name: v.name, type: 'vendor' } });
      if (existing) continue;

      let ledgerAccountId: string | null = null;
      if (creditorsGroup) {
        const ledger = await LedgerAccount.create({
          name: v.name, group_id: creditorsGroup.id,
          opening_balance: 0, opening_balance_type: 'credit',
          description: `Vendor: ${v.name}`,
        } as any);
        ledgerAccountId = ledger.id;
      }

      await Party.create({
        name: v.name, type: 'vendor',
        phone: v.phone, email: v.email,
        gstin: v.gstin,
        state_code: v.state_code,
        billing_address: { city: v.city, state: v.state, state_code: v.state_code },
        ledger_account_id: ledgerAccountId,
      } as any);
      vendCreated++;
    }
    console.log(`  ✓ ${vendCreated} vendors created with ledger accounts`);

    // ─── 7. Bank & Cash Accounts ──────────────────
    console.log('\n═══ Bank & Cash Accounts ═══');
    const cashBankGroup = await AccountGroup.findOne({ where: { name: 'Cash & Bank' } });
    const bankAccounts = [
      { account_name: 'Cash in Hand', account_type: 'cash', opening_balance: 50000, is_default: true },
      { account_name: 'SBI Current Account', account_type: 'current', bank_name: 'State Bank of India', account_number: '38291234567', branch: 'Andheri West', ifsc_code: 'SBIN0001234', opening_balance: 200000 },
      { account_name: 'HDFC Savings Account', account_type: 'savings', bank_name: 'HDFC Bank', account_number: '50100234567890', branch: 'Bandra East', ifsc_code: 'HDFC0001234', opening_balance: 75000 },
    ];

    let bankCreated = 0;
    for (const ba of bankAccounts) {
      const existing = await BankAccount.findOne({ where: { account_name: ba.account_name } });
      if (existing) continue;

      let ledgerAccountId: string | null = null;
      if (cashBankGroup) {
        // Don't create a new ledger for "Cash in Hand" — use the system one
        if (ba.account_type === 'cash') {
          const cashLedger = await LedgerAccount.findOne({ where: { name: 'Cash in Hand', is_system: true } });
          ledgerAccountId = cashLedger?.id || null;
        } else {
          const ledger = await LedgerAccount.create({
            name: ba.account_name, group_id: cashBankGroup.id,
            opening_balance: ba.opening_balance, opening_balance_type: 'debit',
            description: `Bank: ${ba.account_name}`,
          } as any);
          ledgerAccountId = ledger.id;
        }
      }

      await BankAccount.create({
        ...ba,
        current_balance: ba.opening_balance,
        ledger_account_id: ledgerAccountId,
      } as any);
      bankCreated++;
    }
    console.log(`  ✓ ${bankCreated} bank/cash accounts created`);

    // ─── 8. Update Business Settings ──────────────────
    console.log('\n═══ Business Settings ═══');
    await BusinessSettings.update({
      business_name: 'Donezo Billing',
      state_code: '27',
      address: { line1: '123 Business Park', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
      phone: '+919876500000',
      email: 'billing@donezo.com',
    }, { where: {} });
    console.log('  ✓ Business settings updated');

    console.log('\n════════════════════════════════');
    console.log('✓ All master data seeded successfully!');
    console.log('════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Seed failed:', error);
    process.exit(1);
  }
}

seedMasterData();
