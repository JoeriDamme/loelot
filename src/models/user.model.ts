import {
  AllowNull, AutoIncrement, Column, DataType,
  IsEmail, IsUUID, Length, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({
  timestamps: true,
})
export default class User extends Model<User> {
  @IsUUID(4)
  @PrimaryKey
  @AutoIncrement // need this, otherwise INSERT INTO will include try to insert NULL value on Primary Key
  @Column(DataType.UUIDV4)
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
}
