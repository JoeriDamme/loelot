import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import Group from './group.model';
import User from './user.model';

@Table({
  timestamps: true,
})
export default class GroupUser extends Model<GroupUser> {
  @ForeignKey(() => Group)
  @Column(DataType.UUID)
  public groupUuid: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  public userUuid: string;
}
