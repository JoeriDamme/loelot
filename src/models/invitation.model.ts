import { AllowNull, BeforeBulkUpdate, BelongsTo, Column, DataType, DefaultScope, ForeignKey, IsEmail, IsInt, IsUUID, Length, Max, Min, Model,
  Sequelize, Table } from 'sequelize-typescript';
import Group from './group.model';
import User from './user.model';

@DefaultScope({
  attributes: {
    exclude: ['token', 'expiresAt'],
  },
})
@Table({
  indexes: [{
    fields: ['email', 'groupUuid'],
    unique: true,
  }],
  timestamps: true,
})
export default class Invitation extends Model<Invitation> {
    // Delete the UUID property when updating via model, not instance.
  // See https://github.com/sequelize/sequelize/issues/6253#issuecomment-233829414
  @BeforeBulkUpdate
  public static removeReadOnly(instance: any): void {
    delete instance.attributes.uuid;
    delete instance.attributes.groupUuid;
    delete instance.attributes.sentAt;
    delete instance.attributes.timesSent;
    delete instance.attributes.creatorUuid;
    delete instance.attributes.token;
    delete instance.attributes.expiresAt;
  }

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
