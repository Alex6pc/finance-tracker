import { NestFactory } from '@nestjs/core';
import { TransactionsService } from '../services/transactions.service';
import { AppModule } from '../../app.module';
import { TransactionType } from '../entities/transaction.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const transactionsService = app.get(TransactionsService);

  // Sample transactions
  const sampleTransactions = [
    {
      description: 'Salary',
      amount: 2500,
      type: TransactionType.INCOME,
      category: 'Income',
      date: new Date('2023-04-01'),
      isRecurring: true,
      paymentMethod: 'Bank Transfer',
    },
    {
      description: 'Rent',
      amount: 800,
      type: TransactionType.EXPENSE,
      category: 'Housing',
      date: new Date('2023-04-03'),
      isRecurring: true,
      paymentMethod: 'Bank Transfer',
    },
    {
      description: 'Grocery Shopping',
      amount: 120.50,
      type: TransactionType.EXPENSE,
      category: 'Food & Dining',
      date: new Date('2023-04-05'),
      isRecurring: false,
      paymentMethod: 'Credit Card',
    },
    {
      description: 'Freelance Work',
      amount: 350,
      type: TransactionType.INCOME,
      category: 'Income',
      date: new Date('2023-04-10'),
      isRecurring: false,
      paymentMethod: 'PayPal',
    },
    {
      description: 'Netflix Subscription',
      amount: 15.99,
      type: TransactionType.EXPENSE,
      category: 'Subscriptions',
      date: new Date('2023-04-15'),
      isRecurring: true,
      paymentMethod: 'Credit Card',
    },
  ];

  try {
    // Add sample transactions
    for (const transaction of sampleTransactions) {
      await transactionsService.create(transaction);
    }
    console.log('Sample transactions added successfully!');
  } catch (error) {
    console.error('Error seeding transactions:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 