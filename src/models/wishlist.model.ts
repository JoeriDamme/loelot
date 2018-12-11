import { AllowNull, BeforeBulkUpdate, BelongsTo, Column, DataType, DefaultScope, ForeignKey, IsEmail, IsInt, IsUUID, Length, Max, Min, Model,
  Sequelize, Table } from 'sequelize-typescript';
import Group from './group.model';
import User from './user.model';

@Table({
  timestamps: true,
})
export default class WishList extends Model<WishList> {
  @Column({
    defaultValue: Sequelize.fn('uuid_generate_v4'),
    primaryKey: true,
    type: DataType.UUID,
  })
  public uuid: string;

  @IsUUID(4)
  @AllowNull(false)
  @ForeignKey(() => Group)
  @Column(DataType.UUID)
  public groupUuid: string;

  @BelongsTo(() => Group, {
    constraints: true,
  })
  public group: Group;

  @IsUUID(4)
  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  public creatorUuid: string;

  @BelongsTo(() => User, {
    constraints: true,
  })
  public creator: User;

  @AllowNull(false)
  @Column(DataType.TEXT)
  public description: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  public rank: number;
}
