import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm'

@Entity({ name: 'tracking_log', database: 'ads_service' })
export class TrackingLog {
  @ObjectIdColumn()
  _id: ObjectId

  @Column({ name: 'referer' })
  referer: string

  @Column({ name: 'created_at' })
  created_at: Date

  @Column({ name: 'updated_at' })
  updated_at: Date

  @Column({ name: 'banner' })
  banner: object

  @Column({ name: 'banner_group' })
  banner_group: object
}
