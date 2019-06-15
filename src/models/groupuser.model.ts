import { DataTypes, Model, Sequelize } from 'sequelize';

export default class GroupUser extends Model {
  public static attach(sequelize: Sequelize): void {
    GroupUser.init({
      groupUuid: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
      },
      userUuid: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
      },
    }, {
      sequelize,
    });
  }

  public static relations(): void {
    return;
  }

  public readonly groupUuid: string;
  public readonly userUuid: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
}
