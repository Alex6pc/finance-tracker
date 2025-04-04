import { Injectable, BadRequestException } from '@nestjs/common';
import { TransactionsService } from '../../transactions/services/transactions.service';
import { CreateTransactionDto } from '../../transactions/dto/create-transaction.dto';
import { TransactionType } from '../../transactions/entities/transaction.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'papaparse';

interface CSVRow {
  date: string;
  description: string;
  amount: string;
  [key: string]: string;
}

@Injectable()
export class ImportsService {
  constructor(private readonly transactionsService: TransactionsService) {}

  async parseCSV(file: Express.Multer.File): Promise<CreateTransactionDto[]> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const fileContent = fs.readFileSync(file.path, 'utf8');
    
    const parsedResult = csv.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsedResult.errors.length > 0) {
      throw new BadRequestException('Error parsing CSV file');
    }

    return this.mapCSVToTransactions(parsedResult.data as CSVRow[]);
  }

  private mapCSVToTransactions(csvRows: CSVRow[]): CreateTransactionDto[] {
    return csvRows.map(row => {
      // Determine if it's income or expense based on amount (positive or negative)
      const amount = parseFloat(row.amount.replace(/[^-0-9.]/g, ''));
      const type = amount >= 0 ? TransactionType.INCOME : TransactionType.EXPENSE;
      
      // Basic category detection based on description keywords (can be enhanced)
      const category = this.detectCategory(row.description);
      
      return {
        description: row.description,
        amount: Math.abs(amount), // Store absolute value
        type,
        category,
        date: new Date(row.date),
        isRecurring: false, // Default value, can be updated later by user
      };
    });
  }

  private detectCategory(description: string): string {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('salary') || lowerDesc.includes('payroll')) {
      return 'Income';
    } else if (lowerDesc.includes('restaurant') || lowerDesc.includes('cafe') || lowerDesc.includes('food')) {
      return 'Food & Dining';
    } else if (lowerDesc.includes('uber') || lowerDesc.includes('taxi') || lowerDesc.includes('transport')) {
      return 'Transportation';
    } else if (lowerDesc.includes('amazon') || lowerDesc.includes('walmart') || lowerDesc.includes('target')) {
      return 'Shopping';
    } else if (lowerDesc.includes('netflix') || lowerDesc.includes('spotify') || lowerDesc.includes('subscription')) {
      return 'Subscriptions';
    } else {
      return 'Miscellaneous';
    }
  }
} 