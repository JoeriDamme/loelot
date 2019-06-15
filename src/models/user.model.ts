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
import Group from './group.model';
import GroupUser from './groupuser.model';
import Role from './role.model';

export default class User extends Model {
  public static associations: {
    groupAdmin: Association<Group, User>;
    groupCreator: Association<Group, User>;
    groups: Association<Group, User>;
    role: Association<Role, User>;
  };

  public static attach(sequelize: Sequelize): void {
    User.init({
      displayName: {
        allowNull: false,
        type: DataTypes.STRING(255),
        validate: {
          len: [1, 255],
        },
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING(255),
        unique: true,
        validate: {
          isEmail: true,
          len: [1, 255],
        },
      },
      firstName: {
        allowNull: false,
        type: DataTypes.STRING(255),
        validate: {
          len: [1, 255],
        },
      },
      lastName: {
        allowNull: false,
        type: DataTypes.STRING(255),
        validate: {
          len: [1, 255],
        },
      },
      roleUuid: {
        allowNull: false,
        type: DataTypes.UUID,
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
          delete instance.attributes.email;
          return;
        },
      },
      sequelize,
    });
  }

  public static relations(): void {
    User.hasMany(Group, {
      as: 'groupAdmin',
      foreignKey: 'adminUuid',
      sourceKey: 'uuid',
    });

    User.hasMany(Group, {
      as: 'groupCreator',
      foreignKey: 'creatorUuid',
      sourceKey: 'uuid',
    });

    User.belongsToMany(Group, {
      as: 'groups',
      foreignKey: 'userUuid',
      otherKey: 'groupUuid',
      through: 'GroupUsers',
    });

    User.belongsTo(Role, {
      foreignKey: 'roleUuid',
      targetKey: 'uuid',
    });
  }

  public readonly uuid: string;
  public firstName: string;
  public lastName: string;
  public displayName: string;
  public readonly email: string;
  public roleUuid: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  public getGroupAdmin: HasManyGetAssociationsMixin<Group>;
  public addGroupAdmin: HasManyAddAssociationMixin<Group, number>;
  public hasGroupAdmin: HasManyHasAssociationMixin<Group, number>;
  public countGroupAdmin: HasManyCountAssociationsMixin;
  public createGroupAdmin: HasManyCreateAssociationMixin<Group>;

  public getGroupCreator: HasManyGetAssociationsMixin<Group>;
  public addGroupCreator: HasManyAddAssociationMixin<Group, number>;
  public hasGroupCreator: HasManyHasAssociationMixin<Group, number>;
  public countGroupCreator: HasManyCountAssociationsMixin;
  public createGroupCreator: HasManyCreateAssociationMixin<Group>;

  public getGroups: BelongsToManyGetAssociationsMixin<Group>;
  public addGroup: BelongsToManyAddAssociationMixin<Group, number>;
  public hasGroup: BelongsToManyHasAssociationMixin<Group, number>;
  public countGroups: BelongsToManyCountAssociationsMixin;
  public createGroup: BelongsToManyCreateAssociationMixin<Group>;

  public getRole: BelongsToGetAssociationMixin<Role>;
  public createRole: BelongsToCreateAssociationMixin<Role>;

  /**
   * Check if a User is member of a Group.
   * @param uuid UUID of the Group
   */
  public async isMemberGroup(group: Group): Promise<boolean> {
    return this.hasGroup(group);
  }

  /**
   * Check if a User is admin of a Group.
   * @param uuid UUID of the Group
   */
  public async isAdminGroup(group: Group): Promise<boolean> {
    return this.hasGroupAdmin(group);
  }
}

// @Table({
//   timestamps: true,
// })
// export default class User extends Model<User> {
//   @Column({
//     defaultValue: Sequelize.fn('uuid_generate_v4'),
//     primaryKey: true,
//     type: DataType.UUID,
//   })
//   public uuid: string;

//   @AllowNull(false)
//   @Length({
//     max: 255,
//     min: 1,
//   })
//   @Column
//   public firstName: string;

//   @AllowNull(false)
//   @Length({
//     max: 255,
//     min: 1,
//   })
//   @Column
//   public lastName: string;

//   @AllowNull(false)
//   @Length({
//     max: 255,
//     min: 1,
//   })
//   @Column
//   public displayName: string;

//   @AllowNull(false)
//   @Length({
//     max: 255,
//     min: 1,
//   })
//   @IsEmail
//   @Column
//   public email: string;

//   @HasMany(() => Group, {
//     foreignKey: 'adminUuid',
//   })
//   public groupAdmin: Group[];

//   @HasMany(() => Group, {
//     foreignKey: 'creatorUuid',
//   })
//   public groupCreator: Group[];

//   @BelongsToMany(() => Group, () => GroupUser)
//   public groups: Group[];

//   @IsUUID(4)
//   @AllowNull(false)
//   @ForeignKey(() => Role)
//   @Column(DataType.UUID)
//   public roleUuid: string;

//   @BelongsTo(() => Role, {
//     constraints: true,
//   })
//   public role: Role;

//   /**
//    * Check if a User is admin of a Group.
//    * @param uuid UUID of the Group
//    */
//   public async isAdminGroup(uuid: string): Promise<boolean> {
//     const result: any = await this.$has('groupAdmin', uuid); // think a bug in sequelize? return type should be boolean.
//     return !!result;
//   }

//   /**
//    * Check if a User is member of a Group.
//    * @param uuid UUID of the Group
//    */
//   public async isMemberGroup(uuid: string): Promise<boolean> {
//     const result: any = await this.$has('groups', uuid);
//     return !!result;
//   }
// }
