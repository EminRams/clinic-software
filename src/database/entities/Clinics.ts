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
import { Users } from "./Users";
import { Doctors } from "./Doctors";
import { Invoices } from "./Invoices";
import { Patients } from "./Patients";
import { Roles } from "./Roles";

@Index("clinics_pkey", ["id"], { unique: true })
@Entity("clinics", { schema: "public" })
export class Clinics {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("character varying", { name: "name", length: 150 })
  name: string;

  @Column("character varying", { name: "tax_id", nullable: true, length: 14 })
  taxId: string | null;

  @Column("character varying", { name: "cai", nullable: true, length: 50 })
  cai: string | null;

  @Column("bigint", { name: "range_start", nullable: true })
  rangeStart: string | null;

  @Column("bigint", { name: "range_end", nullable: true })
  rangeEnd: string | null;

  @Column("bigint", {
    name: "current_sequence",
    nullable: true,
    default: () => "0",
  })
  currentSequence: string | null;

  @Column("date", { name: "cai_expiration_date", nullable: true })
  caiExpirationDate: string | null;

  @Column("character varying", {
    name: "main_specialty",
    nullable: true,
    length: 100,
  })
  mainSpecialty: string | null;

  @Column("character varying", { name: "phone", nullable: true, length: 20 })
  phone: string | null;

  @Column("text", { name: "address", nullable: true })
  address: string | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @Column("timestamp with time zone", { name: "updated_at", nullable: true })
  updatedAt: Date | null;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @OneToMany(() => Appointments, (appointments) => appointments.clinic)
  appointments: Appointments[];

  @OneToMany(() => Charges, (charges) => charges.clinic)
  charges: Charges[];

  @OneToMany(() => ClinicalNotes, (clinicalNotes) => clinicalNotes.clinic)
  clinicalNotes: ClinicalNotes[];

  @ManyToOne(() => Users, (users) => users.clinics)
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Users;

  @ManyToOne(() => Users, (users) => users.clinics2)
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy: Users;

  @OneToMany(() => Doctors, (doctors) => doctors.clinic)
  doctors: Doctors[];

  @OneToMany(() => Invoices, (invoices) => invoices.clinic)
  invoices: Invoices[];

  @OneToMany(() => Patients, (patients) => patients.clinic)
  patients: Patients[];

  @OneToMany(() => Roles, (roles) => roles.clinic)
  roles: Roles[];

  @OneToMany(() => Users, (users) => users.clinic)
  users: Users[];
}
