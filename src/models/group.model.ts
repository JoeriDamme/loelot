import Sequelize, { Models } from 'sequelize';
import { AllowNull, BeforeBulkUpdate, BelongsTo, Column, DataType, ForeignKey, IsUUID,
  Length, Model, Table } from 'sequelize-typescript';
import User from './user.model';

@Table({
  timestamps: true,
})
export default class Group extends Model<Group> {
  // Delete the UUID property when updating via model, not instance.
  // See https://github.com/sequelize/sequelize/issues/6253#issuecomment-233829414
  @BeforeBulkUpdate
  public static removeUuid(instance: any): void {
    delete instance.attributes.uuid;
  }

  @Column({
    defaultValue: Sequelize.fn('uuid_generate_v4'),
    primaryKey: true,
    type: DataType.UUID,
  })
  public uuid: string;

  @IsUUID(4)
  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  public creatorUuid: string;

  @BelongsTo(() => User, {
    constraints: true,
  })
  public creator: User;

  @IsUUID(4)
  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  public adminUuid: string;

  @BelongsTo(() => User, {
    constraints: true,
  })
  public admin: User;

  @AllowNull(false)
  @Length({
    max: 48,
    min: 1,
  })
  @Column(DataType.STRING(48))
  public name: string;

  @AllowNull(false)
  @Length({
    max: 255,
    min: 1,
  })
  @Column(DataType.STRING(255))
  public icon: string;
}
