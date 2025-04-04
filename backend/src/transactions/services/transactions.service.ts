import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { Transaction, TransactionType } from '../entities/transaction.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { FilterTransactionDto } from '../dto/filter-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const transaction = this.transactionsRepository.create(createTransactionDto);

    return this.transactionsRepository.save(transaction);
  }

  async findAll(filterDto?: FilterTransactionDto): Promise<Transaction[]> {
    const { startDate, endDate, type, category, minAmount, maxAmount } = filterDto || {};
    
    const where: FindOptionsWhere<Transaction> = {};
    
    if (startDate && endDate) {
      where.date = Between(new Date(startDate), new Date(endDate));
    }
    
    if (type) {
      where.type = type;
    }
    
    if (category) {
      where.category = category;
    }
    
    // Amount filtering will be handled in the query
    const query = this.transactionsRepository.createQueryBuilder('transaction');
    
    if (Object.keys(where).length > 0) {
      query.where(where);
    }
    
    if (minAmount !== undefined) {
      query.andWhere('transaction.amount >= :minAmount', { minAmount });
    }
    
    if (maxAmount !== undefined) {
      query.andWhere('transaction.amount <= :maxAmount', { maxAmount });
    }
    
    return query.orderBy('transaction.date', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({ where: { id } });
    
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    
    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto): Promise<Transaction> {
    const transaction = await this.findOne(id);
    Object.assign(transaction, updateTransactionDto);
    return this.transactionsRepository.save(transaction);
  }

  async remove(id: string): Promise<void> {
    const result = await this.transactionsRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
  }

  // Analytics Methods
  async getTotalByType(type: TransactionType, startDate?: Date, endDate?: Date): Promise<number> {
    const query = this.transactionsRepository.createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.type = :type', { type });
    
    if (startDate && endDate) {
      query.andWhere('transaction.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }
    
    const result = await query.getRawOne();
    return parseFloat(result.total) || 0;
  }

  async getTransactionsByCategory(startDate?: Date, endDate?: Date): Promise<any[]> {
    const query = this.transactionsRepository.createQueryBuilder('transaction')
      .select('transaction.category', 'category')
      .addSelect('SUM(transaction.amount)', 'total')
      .groupBy('transaction.category');
    
    if (startDate && endDate) {
      query.where('transaction.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }
    
    return query.getRawMany();
  }

  async importTransactions(transactions: CreateTransactionDto[]): Promise<Transaction[]> {
    const transactionEntities = this.transactionsRepository.create(transactions);
    return this.transactionsRepository.save(transactionEntities);
  }
} 