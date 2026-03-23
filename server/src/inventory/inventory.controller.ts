import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { CreateHsnCodeDto } from './dto/create-hsn-code.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { PaginationQueryDto } from '../common/dto';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { UserById } from '../common/decorators/user-by-id.decorator';

@ApiTags('Inventory')
@ApiBearerAuth('access-token')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ─── Categories ──────────────────────────────

  @Post('categories')
  @RequirePermissions('inventory:create')
  @ApiOperation({ summary: 'Create a category' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.inventoryService.createCategory(dto);
  }

  @Get('categories')
  @RequirePermissions('inventory:read')
  @ApiOperation({ summary: 'Get category tree' })
  async getCategories() {
    return this.inventoryService.getCategories();
  }

  @Put('categories/:id')
  @RequirePermissions('inventory:update')
  @ApiOperation({ summary: 'Update a category' })
  async updateCategory(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateCategoryDto) {
    return this.inventoryService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @RequirePermissions('inventory:delete')
  @ApiOperation({ summary: 'Delete a category (only if no products assigned)' })
  async deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    await this.inventoryService.deleteCategory(id);
    return { message: 'Category deleted successfully.' };
  }

  // ─── Units ──────────────────────────────

  @Post('units')
  @RequirePermissions('inventory:create')
  @ApiOperation({ summary: 'Create a unit of measurement' })
  async createUnit(@Body() dto: CreateUnitDto) {
    return this.inventoryService.createUnit(dto);
  }

  @Get('units')
  @RequirePermissions('inventory:read')
  @ApiOperation({ summary: 'List units with pagination' })
  async getUnits(@Query() query: PaginationQueryDto) {
    return this.inventoryService.getUnits(query);
  }

  @Put('units/:id')
  @RequirePermissions('inventory:update')
  @ApiOperation({ summary: 'Update a unit' })
  async updateUnit(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateUnitDto) {
    return this.inventoryService.updateUnit(id, dto);
  }

  // ─── HSN Codes ──────────────────────────────

  @Post('hsn-codes')
  @RequirePermissions('inventory:create')
  @ApiOperation({ summary: 'Create an HSN code' })
  async createHsnCode(@Body() dto: CreateHsnCodeDto) {
    return this.inventoryService.createHsnCode(dto);
  }

  @Get('hsn-codes')
  @RequirePermissions('inventory:read')
  @ApiOperation({ summary: 'List HSN codes' })
  async getHsnCodes(@Query('search') search?: string) {
    return this.inventoryService.getHsnCodes(search);
  }

  @Put('hsn-codes/:id')
  @RequirePermissions('inventory:update')
  @ApiOperation({ summary: 'Update an HSN code' })
  async updateHsnCode(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateHsnCodeDto) {
    return this.inventoryService.updateHsnCode(id, dto);
  }

  // ─── Products ──────────────────────────────

  @Post('products')
  @RequirePermissions('inventory:create')
  @ApiOperation({ summary: 'Create a product' })
  async createProduct(@Body() dto: CreateProductDto, @UserById() userId: string) {
    return this.inventoryService.createProduct(dto, userId);
  }

  @Get('products')
  @RequirePermissions('inventory:read')
  @ApiOperation({ summary: 'List products with pagination and filters' })
  async getProducts(@Query() query: ProductQueryDto) {
    return this.inventoryService.getProducts(query);
  }

  @Get('products/low-stock')
  @RequirePermissions('inventory:read')
  @ApiOperation({ summary: 'Get low stock products' })
  async getLowStockProducts() {
    return this.inventoryService.getLowStockProducts();
  }

  @Get('products/barcode/:code')
  @RequirePermissions('inventory:read')
  @ApiOperation({ summary: 'Get product by barcode' })
  async getProductByBarcode(@Param('code') code: string) {
    return this.inventoryService.getProductByBarcode(code);
  }

  @Get('products/:id')
  @RequirePermissions('inventory:read')
  @ApiOperation({ summary: 'Get product detail' })
  async getProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.getProduct(id);
  }

  @Put('products/:id')
  @RequirePermissions('inventory:update')
  @ApiOperation({ summary: 'Update a product' })
  async updateProduct(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) {
    return this.inventoryService.updateProduct(id, dto);
  }

  @Get('products/:id/stock-movements')
  @RequirePermissions('inventory:read')
  @ApiOperation({ summary: 'Get stock movement history for a product' })
  async getStockMovements(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.getStockMovements(id);
  }

  // ─── Stock Adjustments ──────────────────────────────

  @Post('stock-adjustments')
  @RequirePermissions('inventory:create')
  @ApiOperation({ summary: 'Create a stock adjustment' })
  async createStockAdjustment(@Body() dto: CreateStockAdjustmentDto, @UserById() userId: string) {
    return this.inventoryService.createStockAdjustment(dto, userId);
  }

  @Get('stock-adjustments')
  @RequirePermissions('inventory:read')
  @ApiOperation({ summary: 'List stock adjustments with pagination' })
  async getStockAdjustments(@Query() query: PaginationQueryDto) {
    return this.inventoryService.getStockAdjustments(query);
  }

  @Get('stock-adjustments/:id')
  @RequirePermissions('inventory:read')
  @ApiOperation({ summary: 'Get stock adjustment detail' })
  async getStockAdjustment(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.getStockAdjustment(id);
  }
}
