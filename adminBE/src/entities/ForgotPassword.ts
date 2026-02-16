// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
// import { Admin } from "./Admin";

// @Entity()
// export class ForgotPassword {
//   @PrimaryGeneratedColumn()
//   request_id!: number;

//   @ManyToOne(() => Admin)
//   admin!: Admin;

//   @Column()
//   password_reset_token!: string;

//   @Column({ default: false })
//   is_used!: boolean;

//   @Column({ type: "timestamp" })
//   requested_at!: Date;

//   @Column({ type: "timestamp" })
//   expires_at!: Date;
// }

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Admin } from "./Admin";

@Entity()
export class ForgotPassword {
    @PrimaryGeneratedColumn()
    request_id!: number;

    @ManyToOne(() => Admin, (admin) => admin.forgotPasswordRequests)
    admin!: Admin;

    @Column({ length: 6 })
    otp!: string;

    @Column()
    contact_method!: string; // 'email' or 'phone'

    @Column({ default: false })
    is_verified!: boolean;

    @Column({ type: "timestamp" })
    requested_at!: Date;

    @Column({ type: "timestamp" })
    expires_at!: Date;
}
