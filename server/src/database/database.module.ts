import { Module, /* OnModuleInit, */ Logger } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
// import { Sequelize } from 'sequelize-typescript';
// import { QueryTypes } from 'sequelize';
import { AppConfigService } from '../config/config.service';
import { User } from '../users/entities/user.entity';
import { LoginSession } from '../sessions/entities/login-session.entity';
import { PasswordHistory } from '../password-history/entities/password-history.entity';
import { Passkey } from '../passkey/entities/passkey.entity';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../roles/entities/permission.entity';
import { RolePermission } from '../roles/entities/role-permission.entity';
// Accounting
import { AccountGroup } from '../accounting/entities/account-group.entity';
import { LedgerAccount } from '../accounting/entities/ledger-account.entity';
import { JournalEntry } from '../accounting/entities/journal-entry.entity';
import { JournalEntryLine } from '../accounting/entities/journal-entry-line.entity';
import { FinancialYear } from '../accounting/entities/financial-year.entity';
import { NumberSequence } from '../accounting/entities/number-sequence.entity';
// Tax
import { TaxRate } from '../tax/entities/tax-rate.entity';
import { BusinessSettings } from '../tax/entities/business-settings.entity';
// Inventory
import { Category } from '../inventory/entities/category.entity';
import { Unit } from '../inventory/entities/unit.entity';
import { HsnCode } from '../inventory/entities/hsn-code.entity';
import { Product } from '../inventory/entities/product.entity';
import { StockMovement } from '../inventory/entities/stock-movement.entity';
import { StockAdjustment } from '../inventory/entities/stock-adjustment.entity';
import { StockAdjustmentItem } from '../inventory/entities/stock-adjustment-item.entity';
// Parties
import { Party } from '../parties/entities/party.entity';
// Banking
import { BankAccount } from '../banking/entities/bank-account.entity';
import { BankTransaction } from '../banking/entities/bank-transaction.entity';
import { PaymentReceipt } from '../banking/entities/payment-receipt.entity';
import { PaymentAllocation } from '../banking/entities/payment-allocation.entity';
// Purchases
import { PurchaseBill } from '../purchases/entities/purchase-bill.entity';
import { PurchaseBillItem } from '../purchases/entities/purchase-bill-item.entity';
import { DebitNote } from '../purchases/entities/debit-note.entity';
import { DebitNoteItem } from '../purchases/entities/debit-note-item.entity';
import { PurchaseOrder } from '../purchases/entities/purchase-order.entity';
import { PurchaseOrderItem } from '../purchases/entities/purchase-order-item.entity';
// Sales
import { SalesInvoice } from '../sales/entities/sales-invoice.entity';
import { SalesInvoiceItem } from '../sales/entities/sales-invoice-item.entity';
import { CreditNote } from '../sales/entities/credit-note.entity';
import { CreditNoteItem } from '../sales/entities/credit-note-item.entity';
import { Quotation } from '../sales/entities/quotation.entity';
import { QuotationItem } from '../sales/entities/quotation-item.entity';
// POS
import { PosTerminal } from '../pos/entities/pos-terminal.entity';
import { PosSession } from '../pos/entities/pos-session.entity';
import { HeldBill } from '../pos/entities/held-bill.entity';
// import { seedRolesAndPermissions } from './seeds/role-permission.seed';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        dialect: 'postgres',
        host: config.dbHost,
        port: config.dbPort,
        username: config.dbUsername,
        password: config.dbPassword,
        database: config.dbName,
        models: [
          User, LoginSession, PasswordHistory, Passkey, Role, Permission, RolePermission,
          AccountGroup, LedgerAccount, JournalEntry, JournalEntryLine, FinancialYear, NumberSequence,
          TaxRate, BusinessSettings,
          Category, Unit, HsnCode, Product, StockMovement, StockAdjustment, StockAdjustmentItem,
          Party,
          BankAccount, BankTransaction, PaymentReceipt, PaymentAllocation,
          PurchaseBill, PurchaseBillItem, DebitNote, DebitNoteItem, PurchaseOrder, PurchaseOrderItem,
          SalesInvoice, SalesInvoiceItem, CreditNote, CreditNoteItem, Quotation, QuotationItem,
          PosTerminal, PosSession, HeldBill,
        ],
        autoLoadModels: false,
        synchronize: false,
        logging: config.appEnv === 'development' ? false : false,
        define: {
          timestamps: true,
          underscored: true,
        },
        ...(config.dbSsl
          ? { dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } }
          : {}),
      }),
    }),
  ],
})
export class DatabaseModule /* implements OnModuleInit */ {
  // private readonly logger = new Logger(DatabaseModule.name);

  // constructor(private readonly sequelize: Sequelize) { }

  // async onModuleInit() {
  //   try {
  //     // Sync new role/permission tables (safe for first run)
  //     const models = [Role, Permission, RolePermission];
  //     const results = await this.sequelize.query<{ tablename: string }>(
  //       `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`,
  //       { type: QueryTypes.SELECT },
  //     );
  //     const existingTables = new Set(results.map((r) => r.tablename));

  //     for (const model of models) {
  //       const tableName = model.getTableName() as string;
  //       if (!existingTables.has(tableName)) {
  //         this.logger.warn(`Table "${tableName}" missing — creating...`);
  //         await model.sync();
  //         this.logger.log(`Table "${tableName}" created.`);
  //       } else {
  //         try {
  //           await model.sync({ alter: true });
  //           this.logger.log(`Table "${tableName}" synced.`);
  //         } catch (error: any) {
  //           if (error?.parent?.code === '42701') {
  //             this.logger.log(`Table "${tableName}" synced (columns already exist).`);
  //           } else {
  //             throw error;
  //           }
  //         }
  //       }
  //     }

  //     // Also sync role_id column on users table
  //     try {
  //       await User.sync({ alter: true });
  //       this.logger.log('Table "users" synced (role_id column).');
  //     } catch (error: any) {
  //       if (error?.parent?.code === '42701') {
  //         this.logger.log('Table "users" synced (role_id column already exists).');
  //       } else {
  //         throw error;
  //       }
  //     }

  //     // Seed default roles and permissions
  //     await seedRolesAndPermissions();
  //   } catch (error) {
  //     this.logger.error('Failed to sync role/permission tables:', error);
  //     throw error;
  //   }
  // }
}
