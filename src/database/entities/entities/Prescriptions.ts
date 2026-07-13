import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { ClinicalNotes } from "./ClinicalNotes";
import { Users } from "./Users";

@Index("prescriptions_pkey", ["id"], { unique: true })
@Entity("prescriptions", { schema: "public" })
export class Prescriptions {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("jsonb", { name: "medications" })
  medications: object;

  @Column("text", { name: "general_instructions", nullable: true })
  generalInstructions: string | null;

  @Column("text", { name: "pdf_url", nullable: true })
  pdfUrl: string | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @Column("timestamp with time zone", { name: "updated_at", nullable: true })
  updatedAt: Date | null;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @ManyToOne(
    () => ClinicalNotes,
    (clinicalNotes) => clinicalNotes.prescriptions,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "clinical_note_id", referencedColumnName: "id" }])
  clinicalNote: ClinicalNotes;

  @ManyToOne(() => Users, (users) => users.prescriptions)
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Users;

  @ManyToOne(() => Users, (users) => users.prescriptions2)
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy: Users;
}
