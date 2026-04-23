import { IsOptional, IsString, IsISO8601 } from 'class-validator';

export class AdminAttendanceReportDto {
  @IsOptional()
  @IsISO8601()
  fromDate?: string;

  @IsOptional()
  @IsISO8601()
  toDate?: string;

  @IsOptional()
  @IsString()
  courseId?: string;

  @IsOptional()
  @IsString()
  teacherId?: string;
}
