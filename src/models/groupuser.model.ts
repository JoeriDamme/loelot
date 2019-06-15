import { DataTypes, Model, Sequelize } from 'sequelize';
import Group from './group.model';
import User from './user.model';

export default class GroupUser extends Model {
  public uuid: string;
  public groupUuid: string;
  public userUuid: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
}

export function init(sequelize: Sequelize): void {
  GroupUser.init({
    groupUuid: {
      allowNull: false,
      type: DataTypes.UUIDV4,
    },
    userUuid: {
      allowNull: false,
      type: DataTypes.UUIDV4,
    },
  }, {
    sequelize,
  });
}
// @Table({
//   timestamps: true,
// })
// export default class GroupUser extends Model<GroupUser> {
//   @ForeignKey(() => Group)
//   @Column(DataType.UUID)
//   public groupUuid: string;

//   @ForeignKey(() => User)
//   @Column(DataType.UUID)
//   public userUuid: string;
// }
