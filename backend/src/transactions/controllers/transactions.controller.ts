import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TransactionsService } from '../services/transactions.service';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { FilterTransactionDto } from '../dto/filter-transaction.dto';
import { Transaction } from '../entities/transaction.entity';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  findAll(@Query() filterDto: FilterTransactionDto): Promise<Transaction[]> {
    return this.transactionsService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Transaction> {
    return this.transactionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    return this.transactionsService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.transactionsService.remove(id);
  }

  @Post('import')
  import(@Body() transactions: CreateTransactionDto[]): Promise<Transaction[]> {
    return this.transactionsService.importTransactions(transactions);
  }

  @Get('analytics/by-type')
  getAnalyticsByType(@Query() filterDto: FilterTransactionDto) {
    // Implementation will be added
  }

  @Get('analytics/by-category')
  getAnalyticsByCategory(@Query() filterDto: FilterTransactionDto) {
    // Implementation will be added
  }
} 