import { Module } from '@nestjs/common';
import { ImportsController } from './controllers/imports.controller';
import { ImportsService } from './services/imports.service';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [TransactionsModule],
  controllers: [ImportsController],
  providers: [ImportsService],
})
export class ImportsModule {} 