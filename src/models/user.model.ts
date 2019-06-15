import { DataTypes, Model, Sequelize } from 'sequelize';
import Group from './group.model';
import GroupUser from './groupuser.model';
import Role from './role.model';

export default class User extends Model {
  public uuid: string;
  public firstName: string;
  public lastName: string;
  public displayName: string;
  public email: string;
  public roleUuid: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
}

export function init(sequelize: Sequelize): void {
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
      type: DataTypes.UUIDV4,
    },
    uuid: {
      defaultValue: Sequelize.fn('uuid_generate_v4'),
      primaryKey: true,
      type: DataTypes.UUIDV4,
    },
  }, {
    sequelize,
  });
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
