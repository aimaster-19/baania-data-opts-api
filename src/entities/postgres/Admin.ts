import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm'
import { Banner } from './Banner'
import { BannerGroup } from './BannerGroup'

export interface IAdmin {
  id: number
  email: string
  phone?: string | null
  name?: string | null
  pictureUrl?: string | null
  firebaseUid?: string | null
  firebaseType?: string | null
  refreshTokens?: string | null
  status?: 'active' | 'inactive' | null
  lastLoginDate?: Date | null
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
  bannersCreatedBy?: any[]
  bannersUpdatedBy?: any[]
  bannersDeletedBy?: any[]
  bannerGroupsCreatedBy?: any[]
  bannerGroupsUpdatedBy?: any[]
  bannerGroupsDeletedBy?: any[]
}

@Entity()
export class Admin extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar', { name: 'email', length: 255 })
  email: string

  @Column('varchar', { name: 'phone', length: 12, nullable: true })
  phone: string | null

  @Column('varchar', { name: 'name', length: 255, nullable: true })
  name: string | null

  @Column('text', { name: 'picture_url', nullable: true })
  pictureUrl: string | null

  @Column('varchar', { name: 'firebase_uid', length: 255, nullable: true })
  firebaseUid: string | null

  @Column('varchar', { name: 'firebase_type', length: 255, nullable: true })
  firebaseType: string | null

  @Column('text', { name: 'refresh_tokens', nullable: true })
  refreshTokens: string | null

  @Column('enum', {
    name: 'status',
    enum: ['active', 'inactive'],
    nullable: true,
  })
  status: 'active' | 'inactive' | null

  @Column({
    name: 'last_login_date',
    type: 'timestamp with time zone',
    nullable: true,
  })
  lastLoginDate: Date | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp with time zone' })
  deletedAt: Date

  @OneToMany('Banner', (banner: any) => banner.createdBy)
  bannersCreatedBy: any[]

  @OneToMany('Banner', (banner: any) => banner.updatedBy)
  bannersUpdatedBy: any[]

  @OneToMany('Banner', (banner: any) => banner.deletedBy)
  bannersDeletedBy: any[]

  @OneToMany('BannerGroup', (bannerGroup: any) => bannerGroup.createdBy)
  bannerGroupsCreatedBy: any[]

  @OneToMany('BannerGroup', (bannerGroup: any) => bannerGroup.updatedBy)
  bannerGroupsUpdatedBy: any[]

  @OneToMany('BannerGroup', (bannerGroup: any) => bannerGroup.deletedBy)
  bannerGroupsDeletedBy: any[]
}
