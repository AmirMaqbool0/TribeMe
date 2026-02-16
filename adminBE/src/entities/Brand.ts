import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Brand {
  @PrimaryGeneratedColumn()
  brand_id!: number;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ nullable: true })
  businessName?: string;

  @Column()
  phoneNumber!: string;

  @Column()
  businessEmail!: string;

  @Column()
  city!: string;

  @Column()
  category!: string; // Single category

  @Column("simple-array", ({ nullable: true }))
  subCategory!: string[]; // Stores array as a comma-separated string

  @Column()
  address!: string;

  @Column()
  zipCode!: string;

  @Column({
    type: "enum",
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  })
  status!: "pending" | "approved" | "rejected";

  @Column({ type: "timestamp", nullable: true })
  approved_at!: Date | null;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at!: Date;

  @Column({ type: "timestamp", nullable: true })
  deleted_at?: Date;
}
