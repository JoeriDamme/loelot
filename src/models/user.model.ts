import Sequelize from 'sequelize';
import { AllowNull, BelongsToMany, Column, DataType, HasMany, IsEmail, Length, Model, Table } from 'sequelize-typescript';
import Group from './group.model';
import GroupUser from './groupuser.model';

@Table({
  timestamps: true,
})
export default class User extends Model<User> {
  @Column({
    defaultValue: Sequelize.fn('uuid_generate_v4'),
    primaryKey: true,
    type: DataType.UUID,
  })
  public uuid: string;

  @AllowNull(false)
  @Length({
    max: 255,
    min: 1,
  })
  @Column
  public firstName: string;

  @AllowNull(false)
  @Length({
    max: 255,
    min: 1,
  })
  @Column
  public lastName: string;

  @AllowNull(false)
  @Length({
    max: 255,
    min: 1,
  })
  @Column
  public displayName: string;

  @AllowNull(false)
  @Length({
    max: 255,
    min: 1,
  })
  @IsEmail
  @Column
  public email: string;

  @HasMany(() => Group, {
    foreignKey: 'adminUuid',
  })
  public groupAdmin: Group[];

  @HasMany(() => Group, {
    foreignKey: 'creatorUuid',
  })
  public groupCreator: Group[];

  @BelongsToMany(() => Group, () => GroupUser)
  public groups: Group[];

  public async isAdminGroup(uuid: string): Promise<boolean> {
    const x: any = await this.$has('groupAdmin', uuid); // think a bug in sequelize? return type should be boolean.
    return !!x;
  }
}
