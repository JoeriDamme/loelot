import Sequelize from 'sequelize';
import { AllowNull, Column, DataType, HasMany, IsEmail, Length, Model, Table } from 'sequelize-typescript';
import Group from './group.model';

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
}
