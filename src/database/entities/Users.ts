import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Appointments } from "./Appointments";
import { Charges } from "./Charges";
import { ClinicalNotes } from "./ClinicalNotes";
import { Clinics } from "./Clinics";
import { Doctors } from "./Doctors";
import { Invoices } from "./Invoices";
import { Patients } from "./Patients";
import { Permissions } from "./Permissions";
import { Prescriptions } from "./Prescriptions";
import { RolePermissions } from "./RolePermissions";
import { Roles } from "./Roles";
import { UserRoles } from "./UserRoles";

@Index("users_email_key", ["email"], { unique: true })
@Index("users_pkey", ["id"], { unique: true })
@Entity("users", { schema: "public" })
export class Users {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("character varying", { name: "full_name", length: 150 })
  fullName: string;

  @Column("character varying", { name: "email", unique: true, length: 150 })
  email: string;

  @Column("character varying", { name: "password_hash", length: 255 })
  passwordHash: string;

  @Column("uuid", { name: "clinic_id" })
  clinicId: string;

  @Column("uuid", { name: "doctor_id", nullable: true })
  doctorId: string | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @Column("timestamp with time zone", { name: "updated_at", nullable: true })
  updatedAt: Date | null;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @OneToMany(() => Appointments, (appointments) => appointments.createdBy)
  appointments: Appointments[];

  @OneToMany(() => Appointments, (appointments) => appointments.updatedBy)
  appointments2: Appointments[];

  @OneToMany(() => Charges, (charges) => charges.createdBy)
  charges: Charges[];

  @OneToMany(() => Charges, (charges) => charges.updatedBy)
  charges2: Charges[];

  @OneToMany(() => ClinicalNotes, (clinicalNotes) => clinicalNotes.createdBy)
  clinicalNotes: ClinicalNotes[];

  @OneToMany(() => ClinicalNotes, (clinicalNotes) => clinicalNotes.updatedBy)
  clinicalNotes2: ClinicalNotes[];

  @OneToMany(() => Clinics, (clinics) => clinics.createdBy)
  clinics: Clinics[];

  @OneToMany(() => Clinics, (clinics) => clinics.updatedBy)
  clinics2: Clinics[];

  @OneToMany(() => Doctors, (doctors) => doctors.createdBy)
  doctors: Doctors[];

  @OneToMany(() => Doctors, (doctors) => doctors.updatedBy)
  doctors2: Doctors[];

  @OneToMany(() => Doctors, (doctors) => doctors.user)
  doctors3: Doctors[];

  @OneToMany(() => Invoices, (invoices) => invoices.createdBy)
  invoices: Invoices[];

  @OneToMany(() => Invoices, (invoices) => invoices.updatedBy)
  invoices2: Invoices[];

  @OneToMany(() => Patients, (patients) => patients.createdBy)
  patients: Patients[];

  @OneToMany(() => Patients, (patients) => patients.updatedBy)
  patients2: Patients[];

  @OneToMany(() => Permissions, (permissions) => permissions.createdBy)
  permissions: Permissions[];

  @OneToMany(() => Permissions, (permissions) => permissions.updatedBy)
  permissions2: Permissions[];

  @OneToMany(() => Prescriptions, (prescriptions) => prescriptions.createdBy)
  prescriptions: Prescriptions[];

  @OneToMany(() => Prescriptions, (prescriptions) => prescriptions.updatedBy)
  prescriptions2: Prescriptions[];

  @OneToMany(
    () => RolePermissions,
    (rolePermissions) => rolePermissions.createdBy
  )
  rolePermissions: RolePermissions[];

  @OneToMany(
    () => RolePermissions,
    (rolePermissions) => rolePermissions.updatedBy
  )
  rolePermissions2: RolePermissions[];

  @OneToMany(() => Roles, (roles) => roles.createdBy)
  roles: Roles[];

  @OneToMany(() => Roles, (roles) => roles.updatedBy)
  roles2: Roles[];

  @OneToMany(() => UserRoles, (userRoles) => userRoles.createdBy)
  userRoles: UserRoles[];

  @OneToMany(() => UserRoles, (userRoles) => userRoles.updatedBy)
  userRoles2: UserRoles[];

  @OneToMany(() => UserRoles, (userRoles) => userRoles.user)
  userRoles3: UserRoles[];

  @ManyToOne(() => Clinics, (clinics) => clinics.users, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "clinic_id", referencedColumnName: "id" }])
  clinic: Clinics;

  @ManyToOne(() => Users, (users) => users.users)
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Users;

  @OneToMany(() => Users, (users) => users.createdBy)
  users: Users[];

  @ManyToOne(() => Doctors, (doctors) => doctors.users)
  @JoinColumn([{ name: "doctor_id", referencedColumnName: "id" }])
  doctor: Doctors;

  @ManyToOne(() => Users, (users) => users.users2)
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy: Users;

  @OneToMany(() => Users, (users) => users.updatedBy)
  users2: Users[];
}
