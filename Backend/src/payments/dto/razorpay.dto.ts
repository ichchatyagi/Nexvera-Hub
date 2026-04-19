import { IsNotEmpty, IsString, IsOptional, IsIn, IsMongoId } from 'class-validator';

export class CreateOrderDto {
  /**
   * MongoDB ID of the target course or tuition class.
   */
  @IsMongoId()
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

  /**
   * Required for tuition 'subject' scope.
   */
  @IsMongoId()
  @IsOptional()
  subjectId?: string;
}

export class VerifyRazorpayDto {
  @IsMongoId()
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
