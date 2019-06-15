import { DataTypes, Model, Sequelize } from 'sequelize';
import Group from './group.model';
import User from './user.model';

export default class GroupUser extends Model {
  public static attach(sequelize: Sequelize): void {
    GroupUser.init({
      groupUuid: {
        allowNull: false,
        // references: {
        //   key: 'uuid',
        //   model: Group,
        // },
        type: DataTypes.UUID,
      },
      userUuid: {
        allowNull: false,
        // references: {
        //   key: 'uuid',
        //   model: User,
        // },
        type: DataTypes.UUID,
      },
    }, {
      sequelize,
    });
  }

  public static relations(): void {
    return;
  }

  public uuid: string;
  public groupUuid: string;
  public userUuid: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
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
