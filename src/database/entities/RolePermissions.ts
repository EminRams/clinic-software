import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Users } from "./Users";
import { Permissions } from "./Permissions";
import { Roles } from "./Roles";

@Index("role_permissions_pkey", ["permissionId", "roleId"], { unique: true })
@Entity("role_permissions", { schema: "public" })
export class RolePermissions {
  @Column("uuid", { primary: true, name: "role_id" })
  roleId: string;

  @Column("uuid", { primary: true, name: "permission_id" })
  permissionId: string;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @Column("timestamp with time zone", { name: "updated_at", nullable: true })
  updatedAt: Date | null;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @ManyToOne(() => Users, (users) => users.rolePermissions)
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Users;

  @ManyToOne(() => Permissions, (permissions) => permissions.rolePermissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "permission_id", referencedColumnName: "id" }])
  permission: Permissions;

  @ManyToOne(() => Roles, (roles) => roles.rolePermissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "role_id", referencedColumnName: "id" }])
  role: Roles;

  @ManyToOne(() => Users, (users) => users.rolePermissions2)
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy: Users;
}
