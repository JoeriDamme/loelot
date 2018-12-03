import Sequelize from 'sequelize';
import { AllowNull, BelongsTo, Column, DataType, ForeignKey, Length, Model, Table } from 'sequelize-typescript';
import User from './user.model';

@Table({
  timestamps: true,
})
export default class Group extends Model<Group> {
  @Column({
    defaultValue: Sequelize.fn('uuid_generate_v4'),
    primaryKey: true,
    type: DataType.UUID,
  })
  public uuid: string;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  public creatorUuid: number;

  @BelongsTo(() => User)
  public creator: User;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  public adminUuid: number;

  @BelongsTo(() => User)
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
