import { AllowNull, BelongsTo, Column, DataType, ForeignKey, IsEmail, IsInt, IsUUID, Length, Max, Min, Model, Sequelize, Table} from 'sequelize-typescript';
import Group from './group.model';
import User from './user.model';

@Table({
  indexes: [{
    fields: ['email', 'groupUuid'],
    unique: true,
  }],
  timestamps: true,
})
export default class Invitation extends Model<Invitation> {
  @Column({
    defaultValue: Sequelize.fn('uuid_generate_v4'),
    primaryKey: true,
    type: DataType.UUID,
  })
  public uuid: string;

  @IsUUID(4)
  @AllowNull(false)
  @ForeignKey(() => Group)
  @Column(DataType.UUID)
  public groupUuid: string;

  @BelongsTo(() => Group, {
    constraints: true,
  })
  public group: Group;

  @IsUUID(4)
  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  public creatorUuid: string;

  @BelongsTo(() => User, {
    constraints: true,
  })
  public creator: User;

  @AllowNull(false)
  @Length({
    max: 255,
    min: 1,
  })
  @IsEmail
  @Column
  public email: string;

  @AllowNull(false)
  @Min(0)
  @Max(255)
  @IsInt
  @Column
  public timesSent: number;

  @AllowNull(false)
  @Column(DataType.DATE)
  public sentAt: string;

  @AllowNull(false)
  @Column(DataType.STRING(96))
  public token: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  public expiresAt: string;
}
