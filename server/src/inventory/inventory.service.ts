import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Op, WhereOptions, literal } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { REPOSITORY } from '../common/constants/app.constants';
import { Category } from './entities/category.entity';
import { Unit } from './entities/unit.entity';
import { HsnCode } from './entities/hsn-code.entity';
import { Product } from './entities/product.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { StockAdjustment } from './entities/stock-adjustment.entity';
import { StockAdjustmentItem } from './entities/stock-adjustment-item.entity';
import { TaxRate } from '../tax/entities/tax-rate.entity';
import { AccountingService } from '../accounting/accounting.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { CreateHsnCodeDto } from './dto/create-hsn-code.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { PaginatedResponseDto } from '../common/dto';

@Injectable()
export class InventoryService {
  constructor(
    @Inject(REPOSITORY.CATEGORIES) private readonly categoryRepo: typeof Category,
    @Inject(REPOSITORY.UNITS) private readonly unitRepo: typeof Unit,
    @Inject(REPOSITORY.HSN_CODES) private readonly hsnCodeRepo: typeof HsnCode,
    @Inject(REPOSITORY.PRODUCTS) private readonly productRepo: typeof Product,
    @Inject(REPOSITORY.STOCK_MOVEMENTS) private readonly stockMovementRepo: typeof StockMovement,
    @Inject(REPOSITORY.STOCK_ADJUSTMENTS) private readonly stockAdjustmentRepo: typeof StockAdjustment,
    @Inject(REPOSITORY.STOCK_ADJUSTMENT_ITEMS) private readonly stockAdjustmentItemRepo: typeof StockAdjustmentItem,
    private readonly accountingService: AccountingService,
    private readonly sequelize: Sequelize,
  ) {}

  // ─── Categories ──────────────────────────────────

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    if (dto.parent_id) {
      const parent = await this.categoryRepo.findByPk(dto.parent_id);
      if (!parent) throw new NotFoundException('Parent category not found.');
    }
    return this.categoryRepo.create({ ...dto } as any);
  }

  async getCategories(): Promise<Category[]> {
    const all = await this.categoryRepo.findAll({
      where: { is_active: true },
      include: [{ model: Category, as: 'children' }],
      order: [['name', 'ASC']],
    });
    return all.filter((c) => !c.parent_id);
  }

  async updateCategory(id: string, dto: Partial<CreateCategoryDto>): Promise<Category> {
    const cat = await this.categoryRepo.findByPk(id);
    if (!cat) throw new NotFoundException('Category not found.');
    await cat.update(dto);
    return cat;
  }

  async deleteCategory(id: string): Promise<void> {
    const productCount = await this.productRepo.count({ where: { category_id: id } });
    if (productCount > 0) throw new BadRequestException('Cannot delete category with assigned products.');
    const cat = await this.categoryRepo.findByPk(id);
    if (!cat) throw new NotFoundException('Category not found.');
    await cat.destroy();
  }

  // ─── Units ──────────────────────────────────

  async createUnit(dto: CreateUnitDto): Promise<Unit> {
    return this.unitRepo.create({ ...dto } as any);
  }

  async getUnits(query?: { page?: number; limit?: number; search?: string; sort_by?: string; sort_order?: string }) {
    const page = query?.page || 1;
    const limit = query?.limit || 50;
    const offset = (page - 1) * limit;
    const where: any = { is_active: true };

    if (query?.search) {
      const search = `%${query.search}%`;
      where[Op.or] = [
        { name: { [Op.iLike]: search } },
        { short_name: { [Op.iLike]: search } },
      ];
    }

    const { rows, count } = await this.unitRepo.findAndCountAll({
      where,
      order: [[query?.sort_by || 'name', (query?.sort_order || 'ASC').toUpperCase()]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);
    return {
      items: rows,
      meta: { total: count, page, limit, total_pages: totalPages, has_next: page < totalPages, has_prev: page > 1 },
    };
  }

  async updateUnit(id: string, dto: Partial<CreateUnitDto>): Promise<Unit> {
    const unit = await this.unitRepo.findByPk(id);
    if (!unit) throw new NotFoundException('Unit not found.');
    await unit.update(dto);
    return unit;
  }

  // ─── HSN Codes ──────────────────────────────────

  async createHsnCode(dto: CreateHsnCodeDto): Promise<HsnCode> {
    const existing = await this.hsnCodeRepo.findOne({ where: { code: dto.code } });
    if (existing) throw new ConflictException(`HSN code "${dto.code}" already exists.`);
    return this.hsnCodeRepo.create({ ...dto } as any);
  }

  async getHsnCodes(search?: string): Promise<HsnCode[]> {
    const where: any = {};
    if (search) {
      where[Op.or] = [
        { code: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }
    return this.hsnCodeRepo.findAll({
      where,
      include: [{ model: TaxRate, attributes: ['id', 'name', 'rate'] }],
      order: [['code', 'ASC']],
    });
  }

  async updateHsnCode(id: string, dto: Partial<CreateHsnCodeDto>): Promise<HsnCode> {
    const hsn = await this.hsnCodeRepo.findByPk(id);
    if (!hsn) throw new NotFoundException('HSN code not found.');
    await hsn.update(dto);
    return hsn;
  }

  // ─── Products ──────────────────────────────────

  async createProduct(dto: CreateProductDto, userId?: string): Promise<Product> {
    const existing = await this.productRepo.findOne({ where: { sku: dto.sku } });
    if (existing) throw new ConflictException(`SKU "${dto.sku}" already exists.`);

    if (dto.barcode) {
      const barcodeExists = await this.productRepo.findOne({ where: { barcode: dto.barcode } });
      if (barcodeExists) throw new ConflictException(`Barcode "${dto.barcode}" already exists.`);
    }

    const transaction = await this.sequelize.transaction();
    try {
      const openingStock = dto.opening_stock || 0;
      const product = await this.productRepo.create(
        {
          ...dto,
          current_stock: openingStock,
          opening_stock: openingStock,
          created_by: userId,
        } as any,
        { transaction },
      );

      // Create opening stock movement if > 0
      if (openingStock > 0) {
        await this.stockMovementRepo.create(
          {
            product_id: product.id,
            movement_type: 'opening',
            quantity: openingStock,
            reference_type: 'opening',
            reference_id: product.id,
            unit_cost: dto.purchase_price,
            stock_before: 0,
            stock_after: openingStock,
            notes: 'Opening stock',
            created_by: userId,
          } as any,
          { transaction },
        );
      }

      await transaction.commit();
      return this.getProduct(product.id);
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ConflictException) throw error;
      console.error('InventoryService.createProduct error:', error);
      throw new InternalServerErrorException('Failed to create product.');
    }
  }

  async getProducts(query: ProductQueryDto): Promise<PaginatedResponseDto<Product>> {
    const where: any = {};

    if (query.category_id) where.category_id = query.category_id;
    if (query.is_active !== undefined) where.is_active = query.is_active === 'true';

    if (query.stock_status === 'low_stock') {
      where[Op.and] = [
        literal('current_stock <= minimum_stock'),
        literal('current_stock > 0'),
      ];
    } else if (query.stock_status === 'out_of_stock') {
      where.current_stock = { [Op.lte]: 0 };
    }

    if (query.search) {
      const search = `%${query.search}%`;
      where[Op.or] = [
        { name: { [Op.iLike]: search } },
        { sku: { [Op.iLike]: search } },
        { barcode: { [Op.iLike]: search } },
      ];
    }

    const { rows, count } = await this.productRepo.findAndCountAll({
      where,
      include: [
        { model: Category, attributes: ['id', 'name'] },
        { model: Unit, attributes: ['id', 'name', 'short_name'] },
        { model: TaxRate, attributes: ['id', 'name', 'rate'] },
      ],
      order: [[query.sort_by, query.sort_order]],
      limit: query.limit,
      offset: query.offset,
    });

    const totalPages = Math.ceil(count / query.limit);
    return {
      items: rows,
      meta: {
        total: count,
        page: query.page,
        limit: query.limit,
        total_pages: totalPages,
        has_next: query.page < totalPages,
        has_prev: query.page > 1,
      },
    };
  }

  async getProduct(id: string): Promise<Product> {
    const product = await this.productRepo.findByPk(id, {
      include: [
        { model: Category, attributes: ['id', 'name'] },
        { model: Unit, attributes: ['id', 'name', 'short_name'] },
        { model: HsnCode, attributes: ['id', 'code', 'description'] },
        { model: TaxRate, attributes: ['id', 'name', 'rate'] },
      ],
    });
    if (!product) throw new NotFoundException('Product not found.');
    return product;
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepo.findByPk(id);
    if (!product) throw new NotFoundException('Product not found.');
    await product.update(dto);
    return this.getProduct(id);
  }

  async getProductByBarcode(barcode: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { barcode, is_active: true },
      include: [
        { model: Category, attributes: ['id', 'name'] },
        { model: Unit, attributes: ['id', 'name', 'short_name'] },
        { model: TaxRate, attributes: ['id', 'name', 'rate'] },
      ],
    });
    if (!product) throw new NotFoundException('Product not found for this barcode.');
    return product;
  }

  async getLowStockProducts(): Promise<Product[]> {
    return this.productRepo.findAll({
      where: {
        is_active: true,
        [Op.and]: [literal('current_stock <= minimum_stock')],
      },
      include: [
        { model: Category, attributes: ['id', 'name'] },
        { model: Unit, attributes: ['id', 'name', 'short_name'] },
      ],
      order: [['current_stock', 'ASC']],
    });
  }

  // ─── Stock Movements ──────────────────────────────

  async getStockMovements(productId: string): Promise<StockMovement[]> {
    return this.stockMovementRepo.findAll({
      where: { product_id: productId },
      order: [['created_at', 'DESC']],
      limit: 100,
    });
  }

  /**
   * Internal method — called by sales, purchases, POS to record stock changes.
   */
  async recordStockMovement(data: {
    productId: string;
    movementType: string;
    quantity: number;
    referenceType: string;
    referenceId: string;
    unitCost: number;
    notes?: string;
    userId?: string;
  }): Promise<void> {
    const product = await this.productRepo.findByPk(data.productId);
    if (!product) throw new NotFoundException(`Product ${data.productId} not found.`);

    const stockBefore = parseFloat(String(product.current_stock));
    const qty = parseFloat(String(data.quantity));

    const isIncrease = ['purchase', 'return_in', 'adjustment_in', 'opening'].includes(data.movementType);
    const stockAfter = isIncrease ? stockBefore + qty : stockBefore - qty;

    await this.stockMovementRepo.create({
      product_id: data.productId,
      movement_type: data.movementType,
      quantity: qty,
      reference_type: data.referenceType,
      reference_id: data.referenceId,
      unit_cost: data.unitCost,
      stock_before: stockBefore,
      stock_after: stockAfter,
      notes: data.notes,
      created_by: data.userId,
    } as any);

    await product.update({ current_stock: stockAfter });
  }

  // ─── Stock Adjustments ──────────────────────────────

  async createStockAdjustment(dto: CreateStockAdjustmentDto, userId: string): Promise<StockAdjustment> {
    const transaction = await this.sequelize.transaction();
    try {
      const fy = await this.accountingService.getActiveFinancialYear();
      const adjustmentNumber = await this.accountingService.getNextNumber('stock_adjustment', fy.name);

      const adjustment = await this.stockAdjustmentRepo.create(
        {
          adjustment_number: adjustmentNumber,
          date: dto.date,
          reason: dto.reason,
          created_by: userId,
        } as any,
        { transaction },
      );

      // Find system ledger accounts for journal entry
      const stockInHandLedger = await this.accountingService.findLedgerByName('Stock-in-Hand');
      const stockAdjLedger = await this.accountingService.findLedgerByName('Stock Adjustment');

      if (!stockInHandLedger || !stockAdjLedger) {
        throw new BadRequestException('System ledger accounts (Stock-in-Hand, Stock Adjustment) not found. Run seed first.');
      }

      const journalLines: { ledgerAccountId: string; debit: number; credit: number; description?: string }[] = [];

      for (const item of dto.items) {
        const product = await this.productRepo.findByPk(item.product_id);
        if (!product) throw new NotFoundException(`Product ${item.product_id} not found.`);

        await this.stockAdjustmentItemRepo.create(
          {
            stock_adjustment_id: adjustment.id,
            product_id: item.product_id,
            adjustment_type: item.adjustment_type,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
          } as any,
          { transaction },
        );

        // Record stock movement
        const stockBefore = parseFloat(String(product.current_stock));
        const qty = parseFloat(String(item.quantity));
        const isIncrease = item.adjustment_type === 'increase';
        const stockAfter = isIncrease ? stockBefore + qty : stockBefore - qty;

        await this.stockMovementRepo.create(
          {
            product_id: item.product_id,
            movement_type: isIncrease ? 'adjustment_in' : 'adjustment_out',
            quantity: qty,
            reference_type: 'stock_adjustment',
            reference_id: adjustment.id,
            unit_cost: item.unit_cost,
            stock_before: stockBefore,
            stock_after: stockAfter,
            notes: dto.reason,
            created_by: userId,
          } as any,
          { transaction },
        );

        await product.update({ current_stock: stockAfter }, { transaction });

        // Build journal entry lines
        const value = parseFloat((qty * item.unit_cost).toFixed(2));
        if (isIncrease) {
          journalLines.push({ ledgerAccountId: stockInHandLedger.id, debit: value, credit: 0, description: `${product.name} +${qty}` });
          journalLines.push({ ledgerAccountId: stockAdjLedger.id, debit: 0, credit: value, description: `${product.name} +${qty}` });
        } else {
          journalLines.push({ ledgerAccountId: stockAdjLedger.id, debit: value, credit: 0, description: `${product.name} -${qty}` });
          journalLines.push({ ledgerAccountId: stockInHandLedger.id, debit: 0, credit: value, description: `${product.name} -${qty}` });
        }
      }

      await transaction.commit();

      // Create journal entry (outside the main transaction since it has its own)
      if (journalLines.length > 0) {
        const je = await this.accountingService.createAutoJournalEntry({
          date: dto.date,
          narration: `Stock Adjustment ${adjustmentNumber}: ${dto.reason || 'Manual adjustment'}`,
          referenceType: 'stock_adjustment',
          referenceId: adjustment.id,
          lines: journalLines,
          userId,
        });
        await adjustment.update({ journal_entry_id: je.id });
      }

      return this.getStockAdjustment(adjustment.id);
    } catch (error) {
      await transaction.rollback();
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      console.error('InventoryService.createStockAdjustment error:', error);
      throw new InternalServerErrorException('Failed to create stock adjustment.');
    }
  }

  async getStockAdjustments(query?: { page?: number; limit?: number; search?: string; sort_by?: string; sort_order?: string }) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const offset = (page - 1) * limit;
    const where: any = {};

    if (query?.search) {
      const search = `%${query.search}%`;
      where[Op.or] = [
        { adjustment_number: { [Op.iLike]: search } },
        { reason: { [Op.iLike]: search } },
      ];
    }

    const { rows, count } = await this.stockAdjustmentRepo.findAndCountAll({
      where,
      include: [{ model: StockAdjustmentItem, include: [{ model: Product, attributes: ['id', 'name', 'sku'] }] }],
      order: [[query?.sort_by || 'created_at', (query?.sort_order || 'DESC').toUpperCase()]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);
    return {
      items: rows,
      meta: { total: count, page, limit, total_pages: totalPages, has_next: page < totalPages, has_prev: page > 1 },
    };
  }

  async getStockAdjustment(id: string): Promise<StockAdjustment> {
    const adj = await this.stockAdjustmentRepo.findByPk(id, {
      include: [{ model: StockAdjustmentItem, include: [{ model: Product, attributes: ['id', 'name', 'sku'] }] }],
    });
    if (!adj) throw new NotFoundException('Stock adjustment not found.');
    return adj;
  }
}
