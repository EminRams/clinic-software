import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Charges } from "./Charges";
import { Clinics } from "./Clinics";
import { Users } from "./Users";

@Index("idx_invoices_sequence", ["clinicId", "sequenceNumber"], {
  unique: true,
})
@Index("invoices_pkey", ["id"], { unique: true })
@Entity("invoices", { schema: "public" })
export class Invoices {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("uuid", { name: "clinic_id" })
  clinicId: string;

  @Column("character varying", { name: "sequence_number", length: 19 })
  sequenceNumber: string;

  @Column("character varying", { name: "cai", length: 50 })
  cai: string;

  @Column("character varying", { name: "issuer_tax_id", length: 14 })
  issuerTaxId: string;

  @Column("character varying", {
    name: "customer_tax_id",
    nullable: true,
    length: 14,
  })
  customerTaxId: string | null;

  @Column("character varying", {
    name: "customer_name",
    nullable: true,
    length: 150,
  })
  customerName: string | null;

  @Column("numeric", { name: "subtotal", precision: 10, scale: 2 })
  subtotal: string;

  @Column("numeric", {
    name: "isv_15",
    nullable: true,
    precision: 10,
    scale: 2,
    default: () => "0",
  })
  isv_15: string | null;

  @Column("numeric", {
    name: "isv_18",
    nullable: true,
    precision: 10,
    scale: 2,
    default: () => "0",
  })
  isv_18: string | null;

  @Column("numeric", { name: "total", precision: 10, scale: 2 })
  total: string;

  @Column("timestamp with time zone", {
    name: "issued_at",
    default: () => "now()",
  })
  issuedAt: Date;

  @Column("text", { name: "pdf_url", nullable: true })
  pdfUrl: string | null;

  @Column("boolean", { name: "voided", default: () => "false" })
  voided: boolean;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @Column("timestamp with time zone", { name: "updated_at", nullable: true })
  updatedAt: Date | null;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @ManyToOne(() => Charges, (charges) => charges.invoices)
  @JoinColumn([{ name: "charge_id", referencedColumnName: "id" }])
  charge: Charges;

  @ManyToOne(() => Clinics, (clinics) => clinics.invoices, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "clinic_id", referencedColumnName: "id" }])
  clinic: Clinics;

  @ManyToOne(() => Users, (users) => users.invoices)
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Users;

  @ManyToOne(() => Users, (users) => users.invoices2)
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy: Users;
}
