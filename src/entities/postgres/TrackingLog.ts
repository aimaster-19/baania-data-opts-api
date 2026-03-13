import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm'
import { Banner } from './Banner'
import { BannerGroup } from './BannerGroup'

@Entity()
export class TrackingLog extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('integer', { name: 'count' })
  count: number

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date

  @ManyToOne('Banner', (banner: any) => banner.trackings)
  @JoinColumn({ name: 'banner_id' })
  banner: any

  @ManyToOne('BannerGroup', (bannerGroup: any) => bannerGroup.trackings)
  @JoinColumn({ name: 'banner_group_code' })
  bannerGroup: any
}
