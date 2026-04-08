import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsOptional()
  @IsIn(['course', 'tuition'])
  product_type?: string;

  @IsString()
  @IsOptional()
  @IsIn(['subject', 'class'])
  access_scope?: string;

  @IsString()
  @IsOptional()
  @IsIn(['monthly', 'bundle'])
  billing_mode?: string;

  @IsString()
  @IsOptional()
  subjectId?: string;
}

export class VerifyRazorpayDto {
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  razorpay_order_id: string;

  @IsString()
  @IsNotEmpty()
  razorpay_payment_id: string;

  @IsString()
  @IsNotEmpty()
  razorpay_signature: string;
}
