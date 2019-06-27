import {
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  DataTypes,
  HasManyAddAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  Model,
  Sequelize,
} from 'sequelize';
import isBase64 from '../lib/is-base-64';
import Invitation from './invitation.model';
import User from './user.model';
import WishList from './wishlist.model';

export default class Group extends Model {
  public static associations: {
    users: Association<User, Group>;
    admin: Association<User, Group>;
    creator: Association<User, Group>;
    wishLists: Association<WishList, Group>;
    invitations: Association<Invitation, Group>;
  };

  public static attach(sequelize: Sequelize): void {
    Group.init({
      adminUuid: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      creatorUuid: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      icon: {
        allowNull: false,
        type: DataTypes.TEXT(),
        validate: {
          isImage(value: string): void {
            const result: boolean = isBase64(value);

            if (!result) {
              throw new Error('Validation base64 string on icon failed');
            }
          },
        },
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING(48),
        validate: {
          len: [6, 48],
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
          delete instance.attributes.uuid;
          delete instance.attributes.creatorUuid;
          return;
        },
      },
      sequelize,
    });
  }

  public static relations(): void {
    Group.belongsTo(User, {
      as: 'creator',
      foreignKey: 'creatorUuid',
      targetKey: 'uuid',
    });

    Group.belongsTo(User, {
      as: 'admin',
      foreignKey: 'adminUuid',
      targetKey: 'uuid',
    });

    Group.belongsToMany(User, {
      as: 'users',
      foreignKey: 'groupUuid',
      otherKey: 'userUuid',
      through: 'GroupUsers',
    });

    Group.hasMany(WishList, {
      as: 'wishLists',
      foreignKey: 'groupUuid',
      sourceKey: 'uuid',
    });

    Group.hasMany(Invitation, {
      as: 'invitations',
      foreignKey: 'groupUuid',
      sourceKey: 'uuid',
    });
  }

  public readonly uuid: string;
  public readonly creatorUuid: string;
  public adminUuid: string;
  public name: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  public getUsers: BelongsToManyGetAssociationsMixin<User>;
  public addUser: BelongsToManyAddAssociationMixin<User, number>;
  public hasUser: BelongsToManyHasAssociationMixin<User, number>;
  public countUsers: BelongsToManyCountAssociationsMixin;
  public createUser: BelongsToManyCreateAssociationMixin<User>;

  public getCreator: BelongsToGetAssociationMixin<User>;
  public createCreator: BelongsToCreateAssociationMixin<User>;

  public getAdmin: BelongsToGetAssociationMixin<User>;
  public createAdmin: BelongsToCreateAssociationMixin<User>;

  public getWishLists: HasManyGetAssociationsMixin<WishList>;
  public addWishList: HasManyAddAssociationMixin<WishList, number>;
  public hasWishList: HasManyHasAssociationMixin<WishList, number>;
  public countWishLists: HasManyCountAssociationsMixin;
  public createWishlist: HasManyCreateAssociationMixin<WishList>;

  public getInvitations: HasManyGetAssociationsMixin<Invitation>;
  public addInvitation: HasManyAddAssociationMixin<Invitation, number>;
  public hasInvitation: HasManyHasAssociationMixin<Invitation, number>;
  public countInvitations: HasManyCountAssociationsMixin;
  public createInvitation: HasManyCreateAssociationMixin<Invitation>;
}
