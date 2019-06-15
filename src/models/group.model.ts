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
  UpdateOptions,
} from 'sequelize';
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
        type: DataTypes.STRING(255),
        validate: {
          len: [1, 255],
        },
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING(48),
        validate: {
          len: [1, 48],
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
// @Table({
//   timestamps: true,
// })
// export default class Group extends Model<Group> {
//   // Delete the UUID property when updating via model, not instance.
//   // See https://github.com/sequelize/sequelize/issues/6253#issuecomment-233829414
//   @BeforeBulkUpdate
//   public static removeUuid(instance: any): void {
//     delete instance.attributes.uuid;
//   }

//   @Column({
//     defaultValue: Sequelize.fn('uuid_generate_v4'),
//     primaryKey: true,
//     type: DataType.UUID,
//   })
//   public uuid: string;

//   @IsUUID(4)
//   @AllowNull(false)
//   @ForeignKey(() => User)
//   @Column(DataType.UUID)
//   public creatorUuid: string;

//   @BelongsTo(() => User, {
//     constraints: true,
//   })
//   public creator: User;

//   @IsUUID(4)
//   @AllowNull(false)
//   @ForeignKey(() => User)
//   @Column(DataType.UUID)
//   public adminUuid: string;

//   @BelongsTo(() => User, {
//     constraints: true,
//   })
//   public admin: User;

//   @AllowNull(false)
//   @Length({
//     max: 48,
//     min: 1,
//   })
//   @Column(DataType.STRING(48))
//   public name: string;

//   @AllowNull(false)
//   @Length({
//     max: 255,
//     min: 1,
//   })
//   @Column(DataType.STRING(255))
//   public icon: string;

//   @BelongsToMany(() => User, () => GroupUser)
//   public users: User[];

//   @HasMany(() => WishList, {
//     foreignKey: 'groupUuid',
//   })
//   public wishLists: WishList[];

//   @HasMany(() => Invitation, {
//     foreignKey: 'groupUuid',
//   })
//   public invitations: Invitation[];
// }
