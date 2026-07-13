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
import { Users } from "./Users";

@Index("idx_patients_clinic", ["clinicId"], {})
@Index("patients_pkey", ["id"], { unique: true })
@Index("idx_patients_national_id", ["nationalId"], {})
@Entity("patients", { schema: "public" })
export class Patients {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("uuid", { name: "clinic_id" })
  clinicId: string;

  @Column("character varying", { name: "full_name", length: 150 })
  fullName: string;

  @Column("character varying", {
    name: "national_id",
    nullable: true,
    length: 20,
  })
  nationalId: string | null;

  @Column("date", { name: "date_of_birth", nullable: true })
  dateOfBirth: string | null;

  @Column("character varying", { name: "sex", nullable: true, length: 1 })
  sex: string | null;

  @Column("character varying", { name: "phone", nullable: true, length: 20 })
  phone: string | null;

  @Column("character varying", { name: "email", nullable: true, length: 150 })
  email: string | null;

  @Column("text", { name: "address", nullable: true })
  address: string | null;

  @Column("character varying", {
    name: "blood_type",
    nullable: true,
    length: 5,
  })
  bloodType: string | null;

  @Column("text", { name: "allergies", nullable: true })
  allergies: string | null;

  @Column("character varying", {
    name: "emergency_contact_name",
    nullable: true,
    length: 150,
  })
  emergencyContactName: string | null;

  @Column("character varying", {
    name: "emergency_contact_phone",
    nullable: true,
    length: 20,
  })
  emergencyContactPhone: string | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @Column("timestamp with time zone", { name: "updated_at", nullable: true })
  updatedAt: Date | null;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @OneToMany(() => Appointments, (appointments) => appointments.patient)
  appointments: Appointments[];

  @OneToMany(() => Charges, (charges) => charges.patient)
  charges: Charges[];

  @OneToMany(() => ClinicalNotes, (clinicalNotes) => clinicalNotes.patient)
  clinicalNotes: ClinicalNotes[];

  @ManyToOne(() => Clinics, (clinics) => clinics.patients, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "clinic_id", referencedColumnName: "id" }])
  clinic: Clinics;

  @ManyToOne(() => Users, (users) => users.patients)
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Users;

  @ManyToOne(() => Users, (users) => users.patients2)
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy: Users;
}
