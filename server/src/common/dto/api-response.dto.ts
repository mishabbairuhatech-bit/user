import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty()
  data: T;

  @ApiProperty({ example: '2026-02-27T12:00:00.000Z' })
  timestamp: string;
}

export class ApiErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'BAD REQUEST' })
  error: string;

  @ApiProperty({ example: 'Validation failed.' })
  message: string;

  @ApiProperty({ example: '2026-02-27T12:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/auth/login' })
  path: string;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Operation completed successfully.' })
  message: string;
}
