import { Injectable } from '@nestjs/common';
import { Op, fn, col, literal } from 'sequelize';
import { AccountingService } from '../accounting/accounting.service';
import { LedgerAccount } from '../accounting/entities/ledger-account.entity';
import { AccountGroup } from '../accounting/entities/account-group.entity';
import { SalesInvoice } from '../sales/entities/sales-invoice.entity';
import { SalesInvoiceItem } from '../sales/entities/sales-invoice-item.entity';
import { PurchaseBill } from '../purchases/entities/purchase-bill.entity';
import { CreditNote } from '../sales/entities/credit-note.entity';
import { DebitNote } from '../purchases/entities/debit-note.entity';
import { Party } from '../parties/entities/party.entity';
import { Product } from '../inventory/entities/product.entity';
import { BankAccount } from '../banking/entities/bank-account.entity';
import { GSTReportPeriodDto, DateRangeDto, DashboardQueryDto } from './dto/report-query.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly accountingService: AccountingService) {}

  // ─── GST Summary (Input vs Output Credit) ──────────────────

  async getGSTSummary(query: DateRangeDto) {
    const fromDate = query.from_date;
    const toDate = query.to_date;

    const getBalance = async (name: string) => {
      const ledger = await LedgerAccount.findOne({ where: { name, is_system: true } });
      if (!ledger) return 0;
      const bal = await this.accountingService.getLedgerBalance(ledger.id, toDate);
      return bal.balance;
    };

    // Output (collected on sales — liability accounts, credit balance)
    const outputCGST = await getBalance('CGST Output');
    const outputSGST = await getBalance('SGST Output');
    const outputIGST = await getBalance('IGST Output');
    const totalOutput = outputCGST + outputSGST + outputIGST;

    // Input (paid on purchases — asset accounts, debit balance)
    const inputCGST = await getBalance('CGST Input');
    const inputSGST = await getBalance('SGST Input');
    const inputIGST = await getBalance('IGST Input');
    const totalInput = inputCGST + inputSGST + inputIGST;

    // Net payable (positive = owe to govt, negative = carry forward credit)
    const netCGST = outputCGST - inputCGST;
    const netSGST = outputSGST - inputSGST;
    const netIGST = outputIGST - inputIGST;

    // IGST cross-utilization
    let adjustedNetIGST = netIGST;
    let adjustedNetCGST = netCGST;
    let adjustedNetSGST = netSGST;

    // If IGST input has excess credit, it can offset CGST and SGST output
    if (adjustedNetIGST < 0) {
      const igstExcess = Math.abs(adjustedNetIGST);
      // First offset CGST
      if (adjustedNetCGST > 0) {
        const cgstOffset = Math.min(igstExcess, adjustedNetCGST);
        adjustedNetCGST -= cgstOffset;
        adjustedNetIGST += cgstOffset;
      }
      // Then offset SGST
      if (adjustedNetIGST < 0 && adjustedNetSGST > 0) {
        const sgstOffset = Math.min(Math.abs(adjustedNetIGST), adjustedNetSGST);
        adjustedNetSGST -= sgstOffset;
        adjustedNetIGST += sgstOffset;
      }
    }

    const totalPayable = Math.max(0, adjustedNetCGST) + Math.max(0, adjustedNetSGST) + Math.max(0, adjustedNetIGST);
    const totalCredit = Math.abs(Math.min(0, adjustedNetCGST)) + Math.abs(Math.min(0, adjustedNetSGST)) + Math.abs(Math.min(0, adjustedNetIGST));

    return {
      period: { from: fromDate, to: toDate },
      output: { cgst: outputCGST, sgst: outputSGST, igst: outputIGST, total: totalOutput },
      input: { cgst: inputCGST, sgst: inputSGST, igst: inputIGST, total: totalInput },
      net: {
        cgst: adjustedNetCGST, sgst: adjustedNetSGST, igst: adjustedNetIGST,
        total_payable: totalPayable, total_credit: totalCredit,
      },
      cross_utilization_applied: netIGST !== adjustedNetIGST,
    };
  }

  // ─── GSTR-1 Data (Outward Supplies) ──────────────────

  async getGSTR1Data(query: GSTReportPeriodDto) {
    const startDate = `${query.year}-${String(query.month).padStart(2, '0')}-01`;
    const endDate = new Date(query.year, query.month, 0).toISOString().split('T')[0];

    const invoices = await SalesInvoice.findAll({
      where: {
        date: { [Op.between]: [startDate, endDate] },
        is_cancelled: false,
      },
      include: [
        { model: Party, attributes: ['id', 'name', 'gstin', 'state_code'] },
        { model: SalesInvoiceItem },
      ],
      order: [['date', 'ASC']],
    });

    // B2B — invoices to registered dealers (with GSTIN)
    const b2bInvoices = invoices.filter((inv) => inv.party?.gstin);
    const b2b = this.groupByGSTIN(b2bInvoices);

    // B2C Large — invoices to unregistered (no GSTIN) > ₹2.5L inter-state
    const b2cLarge = invoices
      .filter((inv) => !inv.party?.gstin && parseFloat(String(inv.grand_total)) > 250000 && parseFloat(String(inv.igst_amount)) > 0)
      .map((inv) => ({
        invoice_number: inv.invoice_number,
        date: inv.date,
        place_of_supply: inv.place_of_supply,
        total_value: parseFloat(String(inv.grand_total)),
        taxable_value: parseFloat(String(inv.taxable_amount)),
        cgst: parseFloat(String(inv.cgst_amount)),
        sgst: parseFloat(String(inv.sgst_amount)),
        igst: parseFloat(String(inv.igst_amount)),
      }));

    // B2C Small — aggregated by rate + place of supply
    const b2cSmallInvoices = invoices.filter((inv) => !inv.party?.gstin && !(parseFloat(String(inv.grand_total)) > 250000 && parseFloat(String(inv.igst_amount)) > 0));
    const b2cs = this.aggregateB2CS(b2cSmallInvoices);

    // Credit notes
    const creditNotes = await CreditNote.findAll({
      where: { date: { [Op.between]: [startDate, endDate] }, is_cancelled: false },
      include: [{ model: Party, attributes: ['id', 'name', 'gstin'] }, { model: SalesInvoice, attributes: ['invoice_number'] }],
    });

    const creditNoteData = creditNotes.map((cn) => ({
      credit_note_number: cn.credit_note_number,
      date: cn.date,
      original_invoice: cn.originalInvoice?.invoice_number,
      customer_gstin: cn.party?.gstin || '',
      taxable_value: parseFloat(String(cn.subtotal)),
      cgst: parseFloat(String(cn.cgst_amount)),
      sgst: parseFloat(String(cn.sgst_amount)),
      igst: parseFloat(String(cn.igst_amount)),
      total: parseFloat(String(cn.grand_total)),
    }));

    // HSN Summary
    const hsnSummary = this.buildHSNSummary(invoices);

    return {
      period: { month: query.month, year: query.year },
      b2b,
      b2c_large: b2cLarge,
      b2cs,
      credit_notes: creditNoteData,
      hsn_summary: hsnSummary,
      total_invoices: invoices.length,
      total_value: invoices.reduce((sum, inv) => sum + parseFloat(String(inv.grand_total)), 0),
    };
  }

  private groupByGSTIN(invoices: SalesInvoice[]) {
    const grouped: Record<string, any> = {};
    for (const inv of invoices) {
      const gstin = inv.party?.gstin || '';
      if (!grouped[gstin]) {
        grouped[gstin] = { customer_gstin: gstin, customer_name: inv.party?.name, invoices: [] };
      }
      grouped[gstin].invoices.push({
        invoice_number: inv.invoice_number,
        date: inv.date,
        total_value: parseFloat(String(inv.grand_total)),
        taxable_value: parseFloat(String(inv.taxable_amount)),
        cgst: parseFloat(String(inv.cgst_amount)),
        sgst: parseFloat(String(inv.sgst_amount)),
        igst: parseFloat(String(inv.igst_amount)),
      });
    }
    return Object.values(grouped);
  }

  private aggregateB2CS(invoices: SalesInvoice[]) {
    const agg: Record<string, any> = {};
    for (const inv of invoices) {
      for (const item of inv.items || []) {
        const rate = parseFloat(String(item.tax_rate)) || 0;
        const pos = inv.place_of_supply || '00';
        const key = `${pos}-${rate}`;
        if (!agg[key]) {
          agg[key] = { place_of_supply: pos, rate, taxable_value: 0, cgst: 0, sgst: 0, igst: 0 };
        }
        agg[key].taxable_value += parseFloat(String(item.taxable_amount));
        agg[key].cgst += parseFloat(String(item.cgst_amount));
        agg[key].sgst += parseFloat(String(item.sgst_amount));
        agg[key].igst += parseFloat(String(item.igst_amount));
      }
    }
    return Object.values(agg).map((a) => ({
      ...a,
      taxable_value: parseFloat(a.taxable_value.toFixed(2)),
      cgst: parseFloat(a.cgst.toFixed(2)),
      sgst: parseFloat(a.sgst.toFixed(2)),
      igst: parseFloat(a.igst.toFixed(2)),
    }));
  }

  private buildHSNSummary(invoices: SalesInvoice[]) {
    const hsn: Record<string, any> = {};
    for (const inv of invoices) {
      for (const item of inv.items || []) {
        const code = item.hsn_code || 'N/A';
        if (!hsn[code]) {
          hsn[code] = { hsn_code: code, quantity: 0, taxable_value: 0, cgst: 0, sgst: 0, igst: 0, total_value: 0 };
        }
        hsn[code].quantity += parseFloat(String(item.quantity));
        hsn[code].taxable_value += parseFloat(String(item.taxable_amount));
        hsn[code].cgst += parseFloat(String(item.cgst_amount));
        hsn[code].sgst += parseFloat(String(item.sgst_amount));
        hsn[code].igst += parseFloat(String(item.igst_amount));
        hsn[code].total_value += parseFloat(String(item.total));
      }
    }
    return Object.values(hsn).map((h) => ({
      ...h,
      taxable_value: parseFloat(h.taxable_value.toFixed(2)),
      cgst: parseFloat(h.cgst.toFixed(2)),
      sgst: parseFloat(h.sgst.toFixed(2)),
      igst: parseFloat(h.igst.toFixed(2)),
      total_value: parseFloat(h.total_value.toFixed(2)),
    }));
  }

  // ─── GSTR-3B Data (Summary Return) ──────────────────

  async getGSTR3BData(query: GSTReportPeriodDto) {
    const startDate = `${query.year}-${String(query.month).padStart(2, '0')}-01`;
    const endDate = new Date(query.year, query.month, 0).toISOString().split('T')[0];

    // Outward supplies (sales)
    const salesInvoices = await SalesInvoice.findAll({
      where: { date: { [Op.between]: [startDate, endDate] }, is_cancelled: false },
    });

    const outwardTaxable = salesInvoices.reduce((sum, inv) => sum + parseFloat(String(inv.taxable_amount)), 0);
    const outwardIGST = salesInvoices.reduce((sum, inv) => sum + parseFloat(String(inv.igst_amount)), 0);
    const outwardCGST = salesInvoices.reduce((sum, inv) => sum + parseFloat(String(inv.cgst_amount)), 0);
    const outwardSGST = salesInvoices.reduce((sum, inv) => sum + parseFloat(String(inv.sgst_amount)), 0);

    // Inward supplies (purchases)
    const purchaseBills = await PurchaseBill.findAll({
      where: { date: { [Op.between]: [startDate, endDate] }, is_cancelled: false },
    });

    const inwardTaxable = purchaseBills.reduce((sum, bill) => sum + parseFloat(String(bill.taxable_amount)), 0);
    const inwardIGST = purchaseBills.reduce((sum, bill) => sum + parseFloat(String(bill.igst_amount)), 0);
    const inwardCGST = purchaseBills.reduce((sum, bill) => sum + parseFloat(String(bill.cgst_amount)), 0);
    const inwardSGST = purchaseBills.reduce((sum, bill) => sum + parseFloat(String(bill.sgst_amount)), 0);

    // ITC available
    const itcIGST = inwardIGST;
    const itcCGST = inwardCGST;
    const itcSGST = inwardSGST;

    // Net tax payable
    const netIGST = Math.max(0, outwardIGST - itcIGST);
    const netCGST = Math.max(0, outwardCGST - itcCGST);
    const netSGST = Math.max(0, outwardSGST - itcSGST);

    return {
      period: { month: query.month, year: query.year },
      outward_supplies: {
        taxable_value: parseFloat(outwardTaxable.toFixed(2)),
        igst: parseFloat(outwardIGST.toFixed(2)),
        cgst: parseFloat(outwardCGST.toFixed(2)),
        sgst: parseFloat(outwardSGST.toFixed(2)),
      },
      inward_supplies: {
        taxable_value: parseFloat(inwardTaxable.toFixed(2)),
        igst: parseFloat(inwardIGST.toFixed(2)),
        cgst: parseFloat(inwardCGST.toFixed(2)),
        sgst: parseFloat(inwardSGST.toFixed(2)),
      },
      itc_available: {
        igst: parseFloat(itcIGST.toFixed(2)),
        cgst: parseFloat(itcCGST.toFixed(2)),
        sgst: parseFloat(itcSGST.toFixed(2)),
      },
      net_tax_payable: {
        igst: parseFloat(netIGST.toFixed(2)),
        cgst: parseFloat(netCGST.toFixed(2)),
        sgst: parseFloat(netSGST.toFixed(2)),
        total: parseFloat((netIGST + netCGST + netSGST).toFixed(2)),
      },
    };
  }

  // ─── Dashboard Summary ──────────────────

  async getDashboardSummary(query: DashboardQueryDto) {
    const fromDate = query.from_date || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const toDate = query.to_date || new Date().toISOString().split('T')[0];

    // Sales
    const salesInvoices = await SalesInvoice.findAll({
      where: { date: { [Op.between]: [fromDate, toDate] }, is_cancelled: false },
    });
    const totalSales = salesInvoices.reduce((sum, inv) => sum + parseFloat(String(inv.grand_total)), 0);

    // Purchases
    const purchaseBills = await PurchaseBill.findAll({
      where: { date: { [Op.between]: [fromDate, toDate] }, is_cancelled: false },
    });
    const totalPurchases = purchaseBills.reduce((sum, bill) => sum + parseFloat(String(bill.grand_total)), 0);

    // Outstanding receivables
    const outstandingReceivables = await SalesInvoice.sum('balance_due', {
      where: { is_cancelled: false, payment_status: { [Op.ne]: 'paid' } },
    }) || 0;

    // Outstanding payables
    const outstandingPayables = await PurchaseBill.sum('balance_due', {
      where: { is_cancelled: false, payment_status: { [Op.ne]: 'paid' } },
    }) || 0;

    // Bank balances
    const bankAccounts = await BankAccount.findAll({ where: { is_active: true } });
    const cashBalance = bankAccounts.filter((a) => a.account_type === 'cash').reduce((sum, a) => sum + parseFloat(String(a.current_balance)), 0);
    const bankBalance = bankAccounts.filter((a) => a.account_type !== 'cash').reduce((sum, a) => sum + parseFloat(String(a.current_balance)), 0);

    // Low stock count
    const lowStockCount = await Product.count({
      where: {
        is_active: true,
        [Op.and]: [literal('current_stock <= minimum_stock'), literal('minimum_stock > 0')],
      },
    });

    // Overdue invoices
    const today = new Date().toISOString().split('T')[0];
    const overdueInvoices = await SalesInvoice.count({
      where: { is_cancelled: false, payment_status: { [Op.ne]: 'paid' }, due_date: { [Op.lt]: today, [Op.ne]: null } },
    });

    const overdueBills = await PurchaseBill.count({
      where: { is_cancelled: false, payment_status: { [Op.ne]: 'paid' }, due_date: { [Op.lt]: today, [Op.ne]: null } },
    });

    // Recent sales (last 5)
    const recentSales = await SalesInvoice.findAll({
      where: { is_cancelled: false },
      include: [{ model: Party, attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['id', 'invoice_number', 'date', 'grand_total', 'payment_status', 'source'],
    });

    return {
      period: { from: fromDate, to: toDate },
      total_sales: parseFloat(totalSales.toFixed(2)),
      total_purchases: parseFloat(totalPurchases.toFixed(2)),
      outstanding_receivables: parseFloat(outstandingReceivables.toFixed(2)),
      outstanding_payables: parseFloat(outstandingPayables.toFixed(2)),
      cash_balance: parseFloat(cashBalance.toFixed(2)),
      bank_balance: parseFloat(bankBalance.toFixed(2)),
      low_stock_count: lowStockCount,
      overdue_invoices: overdueInvoices,
      overdue_bills: overdueBills,
      sales_count: salesInvoices.length,
      purchase_count: purchaseBills.length,
      recent_sales: recentSales,
    };
  }
}
