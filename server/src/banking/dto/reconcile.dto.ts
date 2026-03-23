import { IsArray, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReconcileDto {
  @ApiProperty({ type: [String], description: 'Array of bank transaction UUIDs to reconcile' })
  @IsArray()
  @IsUUID('4', { each: true })
  transaction_ids: string[];

  @ApiProperty({ example: '2026-03-21' })
  @IsDateString()
  reconciled_date: string;
}
