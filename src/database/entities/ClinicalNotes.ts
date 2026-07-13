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
import { Doctors } from "./Doctors";
import { Patients } from "./Patients";
import { Prescriptions } from "./Prescriptions";

@Index("clinical_notes_pkey", ["id"], { unique: true })
@Index("idx_clinical_notes_patient", ["patientId"], {})
@Entity("clinical_notes", { schema: "public" })
export class ClinicalNotes {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("uuid", { name: "patient_id" })
  patientId: string;

  @Column("timestamp with time zone", {
    name: "visit_date",
    default: () => "now()",
  })
  visitDate: Date;

  @Column("text", { name: "chief_complaint", nullable: true })
  chiefComplaint: string | null;

  @Column("text", { name: "subjective", nullable: true })
  subjective: string | null;

  @Column("text", { name: "objective", nullable: true })
  objective: string | null;

  @Column("text", { name: "diagnosis", nullable: true })
  diagnosis: string | null;

  @Column("text", { name: "treatment_plan", nullable: true })
  treatmentPlan: string | null;

  @Column("character varying", {
    name: "icd10_code",
    nullable: true,
    length: 10,
  })
  icd10Code: string | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @Column("timestamp with time zone", { name: "updated_at", nullable: true })
  updatedAt: Date | null;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @ManyToOne(() => Appointments, (appointments) => appointments.clinicalNotes)
  @JoinColumn([{ name: "appointment_id", referencedColumnName: "id" }])
  appointment: Appointments;

  @ManyToOne(() => Clinics, (clinics) => clinics.clinicalNotes, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "clinic_id", referencedColumnName: "id" }])
  clinic: Clinics;

  @ManyToOne(() => Users, (users) => users.clinicalNotes)
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Users;

  @ManyToOne(() => Doctors, (doctors) => doctors.clinicalNotes)
  @JoinColumn([{ name: "doctor_id", referencedColumnName: "id" }])
  doctor: Doctors;

  @ManyToOne(() => Patients, (patients) => patients.clinicalNotes)
  @JoinColumn([{ name: "patient_id", referencedColumnName: "id" }])
  patient: Patients;

  @ManyToOne(() => Users, (users) => users.clinicalNotes2)
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy: Users;

  @OneToMany(() => Prescriptions, (prescriptions) => prescriptions.clinicalNote)
  prescriptions: Prescriptions[];
}
