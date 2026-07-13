import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { RolePermissions } from "./RolePermissions";
import { Clinics } from "./Clinics";
import { Users } from "./Users";
import { UserRoles } from "./UserRoles";

@Index("roles_clinic_id_name_key", ["clinicId", "name"], { unique: true })
@Index("roles_pkey", ["id"], { unique: true })
@Entity("roles", { schema: "public" })
export class Roles {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("uuid", { name: "clinic_id", nullable: true, unique: true })
  clinicId: string | null;

  @Column("character varying", { name: "name", unique: true, length: 100 })
  name: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("boolean", { name: "is_template", default: () => "false" })
  isTemplate: boolean;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @Column("timestamp with time zone", { name: "updated_at", nullable: true })
  updatedAt: Date | null;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @OneToMany(() => RolePermissions, (rolePermissions) => rolePermissions.role)
  rolePermissions: RolePermissions[];

  @ManyToOne(() => Clinics, (clinics) => clinics.roles, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "clinic_id", referencedColumnName: "id" }])
  clinic: Clinics;

  @ManyToOne(() => Users, (users) => users.roles)
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Users;

  @ManyToOne(() => Users, (users) => users.roles2)
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy: Users;

  @OneToMany(() => UserRoles, (userRoles) => userRoles.role)
  userRoles: UserRoles[];
}
