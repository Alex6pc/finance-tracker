import { Controller, Post, UseInterceptors, UploadedFile, HttpStatus, Get } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ImportsService } from '../services/imports.service';
import { TransactionsService } from '../../transactions/services/transactions.service';

@Controller('imports')
export class ImportsController {
  constructor(
    private readonly importsService: ImportsService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          // Create a unique filename with timestamp
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Only accept CSV files
        if (file.mimetype.includes('csv') || file.originalname.match(/\.(csv)$/)) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'No file uploaded or invalid file type. Please upload a CSV file.',
        };
      }

      // Parse the CSV file
      const transactions = await this.importsService.parseCSV(file);
      
      // Import the transactions to the database
      const savedTransactions = await this.transactionsService.importTransactions(transactions);
      
      return {
        status: HttpStatus.OK,
        message: `Successfully imported ${savedTransactions.length} transactions`,
        data: {
          count: savedTransactions.length,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Failed to import transactions: ${error.message}`,
      };
    }
  }
} 