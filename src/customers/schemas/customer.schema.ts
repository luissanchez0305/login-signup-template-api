import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: true })
export class Customer extends Document {
  @Prop({ required: true, trim: true, unique: true })
  email: string;

  @Prop({ required: true, trim: true })
  password: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  surname: string;

  @Prop({ required: true, trim: true })
  country: string;

  @Prop({ required: true, trim: true })
  address: string;

  @Prop({ trim: true })
  addressTwo: string;

  @Prop({ required: true, trim: true })
  province: string;

  @Prop({ required: true, trim: true })
  city: string;

  @Prop({ default: 0 })
  status: number;

  @Prop([String])
  wallets: string[];

  @Prop({ default: false })
  changePasswordNextLogin: boolean;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
