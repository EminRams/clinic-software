import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Users } from "./Users";
import { Roles } from "./Roles";

@Index("user_roles_pkey", ["roleId", "userId"], { unique: true })
@Entity("user_roles", { schema: "public" })
export class UserRoles {
  @Column("uuid", { primary: true, name: "user_id" })
  userId: string;

  @Column("uuid", { primary: true, name: "role_id" })
  roleId: string;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @Column("timestamp with time zone", { name: "updated_at", nullable: true })
  updatedAt: Date | null;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @ManyToOne(() => Users, (users) => users.userRoles)
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Users;

  @ManyToOne(() => Roles, (roles) => roles.userRoles, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "role_id", referencedColumnName: "id" }])
  role: Roles;

  @ManyToOne(() => Users, (users) => users.userRoles2)
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy: Users;

  @ManyToOne(() => Users, (users) => users.userRoles3, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: Users;
}
