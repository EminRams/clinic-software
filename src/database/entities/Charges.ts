import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Appointments } from "./Appointments";
import { Clinics } from "./Clinics";
import { Users } from "./Users";
import { Patients } from "./Patients";
import { Invoices } from "./Invoices";

@Index("charges_pkey", ["id"], { unique: true })
@Entity("charges", { schema: "public" })
export class Charges {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("character varying", { name: "concept", length: 255 })
  concept: string;

  @Column("numeric", { name: "amount", precision: 10, scale: 2 })
  amount: string;

  @Column("character varying", {
    name: "payment_method",
    nullable: true,
    length: 20,
  })
  paymentMethod: string | null;

  @Column("character varying", {
    name: "charge_status",
    nullable: true,
    length: 20,
    default: () => "'pending'",
  })
  chargeStatus: string | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @Column("timestamp with time zone", { name: "updated_at", nullable: true })
  updatedAt: Date | null;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @ManyToOne(() => Appointments, (appointments) => appointments.charges)
  @JoinColumn([{ name: "appointment_id", referencedColumnName: "id" }])
  appointment: Appointments;

  @ManyToOne(() => Clinics, (clinics) => clinics.charges, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "clinic_id", referencedColumnName: "id" }])
  clinic: Clinics;

  @ManyToOne(() => Users, (users) => users.charges)
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Users;

  @ManyToOne(() => Patients, (patients) => patients.charges)
  @JoinColumn([{ name: "patient_id", referencedColumnName: "id" }])
  patient: Patients;

  @ManyToOne(() => Users, (users) => users.charges2)
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy: Users;

  @OneToMany(() => Invoices, (invoices) => invoices.charge)
  invoices: Invoices[];
}
