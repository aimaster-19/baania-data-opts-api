import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn
} from 'typeorm'

@Entity('b_package_activity')
export class BPackageActivity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar', { name: 'activity_name', length: 255 })
  activity_name: string

  @Column('integer', { name: 'credit_usage' })
  credit_usage: number

  @Column('varchar', { name: 'activity_code' })
  activity_code: string

  @Column('boolean', { name: 'status' })
  status: boolean

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date

  @Column({ name: 'deleted_at' })
  deletedAt: Date
}
