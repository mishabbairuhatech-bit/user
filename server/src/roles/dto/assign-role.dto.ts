import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({ description: 'Role UUID to assign to the user' })
  @IsUUID('4')
  role_id: string;
}
