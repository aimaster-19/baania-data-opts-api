import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
  OneToMany
} from 'typeorm'
import { BannerGroup } from './BannerGroup'
import { Admin } from './Admin'
import { TrackingLog } from './TrackingLog'

@Entity()
export class Banner extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar', { name: 'name', length: 255 })
  name: string

  @Column('varchar', { name: 'display_name', length: 255 })
  displayName: string

  @Column('text', { name: 'link' })
  link: string

  @Column('text', { name: 'image_url' })
  imageUrl: string

  @Column('text', { name: 'image_mobile_url' })
  imageMobileUrl: string

  @Column('text', { name: 'alt_text', nullable: true })
  altText: string | null

  @Column({ name: 'start_date', type: 'timestamp with time zone' })
  startDate: Date

  @Column({ name: 'end_date', type: 'timestamp with time zone' })
  endDate: Date

  @Column('varchar', { name: 'keywords', array: true, default: [] })
  keywords: string[]

  @Column('integer', { name: 'random_display_count', default: 0 })
  randomDisplayCount: number

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp with time zone' })
  deletedAt: Date

  @ManyToOne('BannerGroup', (bannerGroup: any) => bannerGroup.banners)
  @JoinColumn({ name: 'banner_group_code' })
  bannerGroup: any

  @ManyToOne('Admin', (admin: any) => admin.bannersCreatedBy)
  @JoinColumn({ name: 'created_by' })
  createdBy: any

  @ManyToOne('Admin', (admin: any) => admin.bannersUpdatedBy)
  @JoinColumn({ name: 'updated_by' })
  updatedBy: any

  @ManyToOne('Admin', (admin: any) => admin.bannersDeletedBy)
  @JoinColumn({ name: 'deleted_by' })
  deletedBy: any

  @OneToMany('TrackingLog', (trackingLog: any) => trackingLog.banner)
  trackings: any[]
}
