import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "video_reward" })
export class VideoReward {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  userId!: string;

  @Column()
  videoId!: string;

  @Column("decimal")
  rewardAmount!: number;
}
