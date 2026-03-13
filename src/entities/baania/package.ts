import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn
} from 'typeorm'

@Entity('b_package')
export class BPackage extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar', { name: 'package_name', length: 255 })
  package_name: string

  @Column('integer', { name: 'credit' })
  credit: number

  @Column('integer', { name: 'free_credit' })
  free_credit: number

  @Column('integer', { name: 'price' })
  price: number

  @Column('integer', { name: 'discount' })
  discount: number

  @Column('boolean', { name: 'status' })
  status: boolean

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date

  @Column({ name: 'deleted_at' })
  deletedAt: Date
}
