import { REPOSITORY } from '../common/constants/app.constants';
import { Category } from './entities/category.entity';
import { Unit } from './entities/unit.entity';
import { HsnCode } from './entities/hsn-code.entity';
import { Product } from './entities/product.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { StockAdjustment } from './entities/stock-adjustment.entity';
import { StockAdjustmentItem } from './entities/stock-adjustment-item.entity';

export const inventoryProviders = [
  { provide: REPOSITORY.CATEGORIES, useValue: Category },
  { provide: REPOSITORY.UNITS, useValue: Unit },
  { provide: REPOSITORY.HSN_CODES, useValue: HsnCode },
  { provide: REPOSITORY.PRODUCTS, useValue: Product },
  { provide: REPOSITORY.STOCK_MOVEMENTS, useValue: StockMovement },
  { provide: REPOSITORY.STOCK_ADJUSTMENTS, useValue: StockAdjustment },
  { provide: REPOSITORY.STOCK_ADJUSTMENT_ITEMS, useValue: StockAdjustmentItem },
];
