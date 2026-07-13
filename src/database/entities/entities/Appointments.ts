import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Clinics } from "./Clinics";
import { Users } from "./Users";
import { Doctors } from "./Doctors";
import { Patients } from "./Patients";
import { Charges } from "./Charges";
import { ClinicalNotes } from "./ClinicalNotes";

@Index("idx_appointments_clinic_date", ["clinicId", "scheduledAt"], {})
@Index("idx_appointments_doctor_date", ["doctorId", "scheduledAt"], {})
@Index("appointments_pkey", ["id"], { unique: true })
@Entity("appointments", { schema: "public" })
export class Appointments {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("uuid", { name: "clinic_id" })
  clinicId: string;

  @Column("uuid", { name: "doctor_id" })
  doctorId: string;

  @Column("timestamp with time zone", { name: "scheduled_at" })
  scheduledAt: Date;

  @Column("integer", {
    name: "duration_minutes",
    nullable: true,
    default: () => "30",
  })
  durationMinutes: number | null;

  @Column("character varying", { name: "reason", nullable: true, length: 255 })
  reason: string | null;

  @Column("character varying", {
    name: "appointment_status",
    nullable: true,
    length: 20,
    default: () => "'scheduled'",
  })
  appointmentStatus: string | null;

  @Column("boolean", {
    name: "reminder_sent",
    nullable: true,
    default: () => "false",
  })
  reminderSent: boolean | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @Column("timestamp with time zone", { name: "updated_at", nullable: true })
  updatedAt: Date | null;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @ManyToOne(() => Clinics, (clinics) => clinics.appointments, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "clinic_id", referencedColumnName: "id" }])
  clinic: Clinics;

  @ManyToOne(() => Users, (users) => users.appointments)
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Users;

  @ManyToOne(() => Doctors, (doctors) => doctors.appointments)
  @JoinColumn([{ name: "doctor_id", referencedColumnName: "id" }])
  doctor: Doctors;

  @ManyToOne(() => Patients, (patients) => patients.appointments)
  @JoinColumn([{ name: "patient_id", referencedColumnName: "id" }])
  patient: Patients;

  @ManyToOne(() => Users, (users) => users.appointments2)
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy: Users;

  @OneToMany(() => Charges, (charges) => charges.appointment)
  charges: Charges[];

  @OneToMany(() => ClinicalNotes, (clinicalNotes) => clinicalNotes.appointment)
  clinicalNotes: ClinicalNotes[];
}
