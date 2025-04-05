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
    
    const where: FindOptionsWhere<Transaction> = { isDeleted: false };
    
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
    
    // Always filter out deleted transactions
    query.where('transaction.isDeleted = :isDeleted', { isDeleted: false });
    
    if (Object.keys(where).length > 1) { // > 1 because we already have isDeleted
      // We need to use andWhere since we already have a where clause
      Object.entries(where).forEach(([key, value]) => {
        if (key !== 'isDeleted') { // Skip isDeleted as we already added it
          if (key === 'date') {
            query.andWhere('transaction.date BETWEEN :startDate AND :endDate', {
              startDate: startDate ? new Date(startDate) : new Date(),
              endDate: endDate ? new Date(endDate) : new Date(),
            });
          } else {
            query.andWhere(`transaction.${key} = :${key}`, { [key]: value });
          }
        }
      });
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
    const transaction = await this.transactionsRepository.findOne({ 
      where: { id, isDeleted: false } 
    });
    
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
    // Implement soft delete
    const transaction = await this.findOne(id);
    transaction.isDeleted = true;
    await this.transactionsRepository.save(transaction);
  }

  // Analytics Methods
  async getTotalByType(type: TransactionType, startDate?: Date, endDate?: Date): Promise<number> {
    const query = this.transactionsRepository.createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.type = :type', { type })
      .andWhere('transaction.isDeleted = :isDeleted', { isDeleted: false });
    
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
      .where('transaction.isDeleted = :isDeleted', { isDeleted: false })
      .groupBy('transaction.category');
    
    if (startDate && endDate) {
      query.andWhere('transaction.date BETWEEN :startDate AND :endDate', {
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