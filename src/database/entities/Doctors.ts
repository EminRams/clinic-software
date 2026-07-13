import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Appointments } from "./Appointments";
import { ClinicalNotes } from "./ClinicalNotes";
import { Clinics } from "./Clinics";
import { Users } from "./Users";

@Index("doctors_pkey", ["id"], { unique: true })
@Entity("doctors", { schema: "public" })
export class Doctors {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("character varying", { name: "full_name", length: 150 })
  fullName: string;

  @Column("character varying", {
    name: "specialty",
    nullable: true,
    length: 100,
  })
  specialty: string | null;

  @Column("character varying", {
    name: "license_number",
    nullable: true,
    length: 50,
  })
  licenseNumber: string | null;

  @Column("text", { name: "digital_signature_url", nullable: true })
  digitalSignatureUrl: string | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @Column("timestamp with time zone", { name: "updated_at", nullable: true })
  updatedAt: Date | null;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @OneToMany(() => Appointments, (appointments) => appointments.doctor)
  appointments: Appointments[];

  @OneToMany(() => ClinicalNotes, (clinicalNotes) => clinicalNotes.doctor)
  clinicalNotes: ClinicalNotes[];

  @ManyToOne(() => Clinics, (clinics) => clinics.doctors, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "clinic_id", referencedColumnName: "id" }])
  clinic: Clinics;

  @ManyToOne(() => Users, (users) => users.doctors)
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Users;

  @ManyToOne(() => Users, (users) => users.doctors2)
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy: Users;

  @ManyToOne(() => Users, (users) => users.doctors3)
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: Users;

  @OneToMany(() => Users, (users) => users.doctor)
  users: Users[];
}
