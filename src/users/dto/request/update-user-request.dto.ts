import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class UpdateUserRequestDto {
  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  @IsOptional()
  fullName?: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsOptional()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password?: string;

  @IsUUID('4', { message: 'El ID de la clínica debe ser un UUID válido' })
  @IsOptional()
  clinicId?: string;

  @IsUUID('4', { message: 'El ID del doctor debe ser un UUID válido' })
  @IsOptional()
  doctorId?: string;

  @IsBoolean({ message: 'El estado debe ser verdadero o falso' })
  @IsOptional()
  status?: boolean;
}
