import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Users } from "./Users";
import { RolePermissions } from "./RolePermissions";

@Index("permissions_code_key", ["code"], { unique: true })
@Index("permissions_pkey", ["id"], { unique: true })
@Entity("permissions", { schema: "public" })
export class Permissions {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("character varying", { name: "code", unique: true, length: 100 })
  code: string;

  @Column("character varying", { name: "module", length: 50 })
  module: string;

  @Column("text", { name: "description" })
  description: string;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @Column("timestamp with time zone", { name: "updated_at", nullable: true })
  updatedAt: Date | null;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @ManyToOne(() => Users, (users) => users.permissions)
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Users;

  @ManyToOne(() => Users, (users) => users.permissions2)
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy: Users;

  @OneToMany(
    () => RolePermissions,
    (rolePermissions) => rolePermissions.permission
  )
  rolePermissions: RolePermissions[];
}
