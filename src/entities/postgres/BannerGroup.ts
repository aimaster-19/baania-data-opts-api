import {
  BaseEntity,
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn
} from 'typeorm'
import { Admin } from './Admin'
import { Banner } from './Banner'
import { TrackingLog } from './TrackingLog'

@Entity()
export class BannerGroup extends BaseEntity {
  @PrimaryColumn('varchar', { name: 'code', length: 100 })
  code: string

  @Column('varchar', { name: 'name', length: 255 })
  name: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp with time zone' })
  deletedAt: Date

  @ManyToOne('Admin', (admin: any) => admin.bannersCreatedBy)
  @JoinColumn({ name: 'created_by' })
  createdBy: any

  @ManyToOne('Admin', (admin: any) => admin.bannersUpdatedBy)
  @JoinColumn({ name: 'updated_by' })
  updatedBy: any

  @ManyToOne('Admin', (admin: any) => admin.bannersDeletedBy)
  @JoinColumn({ name: 'deleted_by' })
  deletedBy: any

  @OneToMany('Banner', (banner: any) => banner.bannerGroup)
  banners: any[]

  @OneToMany('TrackingLog', (trackingLog: any) => trackingLog.bannerGroup)
  trackings: any[]
}
