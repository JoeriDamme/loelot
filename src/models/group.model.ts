import Sequelize from 'sequelize';
import { AllowNull, BeforeBulkUpdate, BelongsTo, BelongsToMany, Column, DataType, ForeignKey, HasMany, IsUUID,
  Length, Model, Table } from 'sequelize-typescript';
import GroupUser from './groupuser.model';
import Invitation from './invitation.model';
import User from './user.model';
import WishList from './wishlist.model';

@Table({
  timestamps: true,
})
export default class Group extends Model<Group> {
  // Delete the UUID property when updating via model, not instance.
  // See https://github.com/sequelize/sequelize/issues/6253#issuecomment-233829414
  @BeforeBulkUpdate
  public static removeUuid(instance: any): void {
    delete instance.attributes.uuid;
  }

  @Column({
    defaultValue: Sequelize.fn('uuid_generate_v4'),
    primaryKey: true,
    type: DataType.UUID,
  })
  public uuid: string;

  @IsUUID(4)
  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  public creatorUuid: string;

  @BelongsTo(() => User, {
    constraints: true,
  })
  public creator: User;

  @IsUUID(4)
  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  public adminUuid: string;

  @BelongsTo(() => User, {
    constraints: true,
  })
  public admin: User;

  @AllowNull(false)
  @Length({
    max: 48,
    min: 1,
  })
  @Column(DataType.STRING(48))
  public name: string;

  @AllowNull(false)
  @Length({
    max: 255,
    min: 1,
  })
  @Column(DataType.STRING(255))
  public icon: string;

  @BelongsToMany(() => User, () => GroupUser)
  public users: User[];

  @HasMany(() => WishList, {
    foreignKey: 'groupUuid',
  })
  public wishLists: WishList[];

  @HasMany(() => Invitation, {
    foreignKey: 'groupUuid',
  })
  public invitations: Invitation[];
}
