import {
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  DataTypes,
  Model,
  Sequelize,
} from 'sequelize';
import Group from './group.model';
import User from './user.model';

export default class WishList extends Model {
  public static associations: {
    group: Association<Group, WishList>;
    creator: Association<User, WishList>;
  };

  public static attach(sequelize: Sequelize): void {
    WishList.init({
      creatorUuid: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      description: {
        allowNull: false,
        type: DataTypes.TEXT(),
        validate: {
          len: [1, 512],
        },
      },
      groupUuid: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      rank: {
        allowNull: false,
        type: DataTypes.INTEGER(),
        validate: {
          isInt: true,
          max: 255,
          min: 1,
        },
      },
      uuid: {
        defaultValue: Sequelize.fn('uuid_generate_v4'),
        primaryKey: true,
        type: DataTypes.UUID,
      },
    }, {
      hooks: {
        beforeBulkUpdate: (instance: any): void => {
          // not possible to update the following attributes
          delete instance.attributes.uuid;
          delete instance.attributes.groupUuid;
          delete instance.attributes.creatorUuid;
          return;
        },
      },
      sequelize,
    });
  }

  public static relations(): void {
    WishList.belongsTo(Group, {
      as: 'group',
      foreignKey: 'groupUuid',
      targetKey: 'uuid',
    });

    WishList.belongsTo(User, {
      as: 'creator',
      foreignKey: 'creatorUuid',
      targetKey: 'uuid',
    });
  }

  public readonly uuid: string;
  public readonly creatorUuid: string;
  public description: string;
  public readonly groupUuid: string;
  public rank: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  public getGroup: BelongsToGetAssociationMixin<Group>;
  public createGroup: BelongsToCreateAssociationMixin<Group>;

  public getCreator: BelongsToGetAssociationMixin<User>;
  public createCreator: BelongsToCreateAssociationMixin<User>;
}
