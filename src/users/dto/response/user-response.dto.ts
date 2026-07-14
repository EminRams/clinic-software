import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  fullName: string;

  @Expose()
  email: string;

  @Expose()
  clinicId: string;

  @Expose()
  doctorId: string | null;

  @Expose()
  status: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date | null;

  @Exclude()
  passwordHash: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
