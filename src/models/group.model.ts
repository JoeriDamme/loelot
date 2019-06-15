import { DataTypes, Model, Sequelize } from 'sequelize';
import GroupUser from './groupuser.model';
import Invitation from './invitation.model';
import User from './user.model';
import WishList from './wishlist.model';

export default class Group extends Model {
  public uuid: string;
  public creatorUuid: string;
  public adminUuid: string;
  public name: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
}

export function init(sequelize: Sequelize): void {
  Group.init({
    adminUuid: {
      allowNull: false,
      type: DataTypes.UUIDV4,
    },
    creatorUuid: {
      allowNull: false,
      type: DataTypes.UUIDV4,
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
      type: DataTypes.UUIDV4,
    },
  }, {
    sequelize,
  });

  return;
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
