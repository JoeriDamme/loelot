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
import User from './user.model';

export default class Invitation extends Model {
  public static associations: {
    group: Association<Invitation, Group>;
    creator: Association<Invitation, User>;
  };

  public static attach(sequelize: Sequelize): void {
    Invitation.init({
      creatorUuid: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING(255),
        validate: {
          isEmail: true,
          len: [1, 255],
        },
      },
      expiresAt: {
        allowNull: false,
        type: DataTypes.DATE(),
      },
      groupUuid: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      sentAt: {
        allowNull: false,
        type: DataTypes.DATE(),
      },
      timesSent: {
        allowNull: false,
        type: DataTypes.INTEGER(),
        validate: {
          max: 99,
          min: 1,
        },
      },
      token: {
        allowNull: false,
        type: DataTypes.STRING(96),
      },
      uuid: {
        defaultValue: Sequelize.fn('uuid_generate_v4'),
        primaryKey: true,
        type: DataTypes.UUID,
      },
    }, {
      defaultScope: {
        attributes: {
          exclude: ['token', 'expiresAt'],
        },
      },
      hooks: {
        beforeBulkUpdate: (instance: any): void => {
          // not possible to update the following attributes
          delete instance.attributes.uuid;
          delete instance.attributes.groupUuid;
          delete instance.attributes.sentAt;
          delete instance.attributes.timesSent;
          delete instance.attributes.creatorUuid;
          delete instance.attributes.token;
          delete instance.attributes.expiresAt;
          return;
        },
      },
      indexes: [{
        fields: ['email', 'groupUuid'],
        unique: true,
      }],
      sequelize,
    });
  }

  public static relations(): void {
    Invitation.belongsTo(Group, {
      as: 'group',
      foreignKey: 'groupUuid',
      targetKey: 'uuid',
    });

    Invitation.belongsTo(User, {
      as: 'creator',
      foreignKey: 'creatorUuid',
      targetKey: 'uuid',
    });
  }

  public readonly uuid: string;
  public groupUuid: string;
  public creatorUuid: string;
  public email: string;
  public timesSent: number;
  public sentAt: Date;
  public token: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  public getGroup: BelongsToGetAssociationMixin<Group>;
  public createGroup: BelongsToCreateAssociationMixin<Group>;

  public getCreator: BelongsToGetAssociationMixin<User>;
  public createCreator: BelongsToCreateAssociationMixin<User>;
}

// @DefaultScope({
//   attributes: {
//     exclude: ['token', 'expiresAt'],
//   },
// })
// @Table({
//   indexes: [{
//     fields: ['email', 'groupUuid'],
//     unique: true,
//   }],
//   timestamps: true,
// })
// export default class Invitation extends Model<Invitation> {
//     // Delete the UUID property when updating via model, not instance.
//   // See https://github.com/sequelize/sequelize/issues/6253#issuecomment-233829414
//   @BeforeBulkUpdate
//   public static removeReadOnly(instance: any): void {
//     delete instance.attributes.uuid;
//     delete instance.attributes.groupUuid;
//     delete instance.attributes.sentAt;
//     delete instance.attributes.timesSent;
//     delete instance.attributes.creatorUuid;
//     delete instance.attributes.token;
//     delete instance.attributes.expiresAt;
//   }

//   @Column({
//     defaultValue: Sequelize.fn('uuid_generate_v4'),
//     primaryKey: true,
//     type: DataType.UUID,
//   })
//   public uuid: string;

//   @IsUUID(4)
//   @AllowNull(false)
//   @ForeignKey(() => Group)
//   @Column(DataType.UUID)
//   public groupUuid: string;

//   @BelongsTo(() => Group, {
//     constraints: true,
//   })
//   public group: Group;

//   @IsUUID(4)
//   @AllowNull(false)
//   @ForeignKey(() => User)
//   @Column(DataType.UUID)
//   public creatorUuid: string;

//   @BelongsTo(() => User, {
//     constraints: true,
//   })
//   public creator: User;

//   @AllowNull(false)
//   @Length({
//     max: 255,
//     min: 1,
//   })
//   @IsEmail
//   @Column
//   public email: string;

//   @AllowNull(false)
//   @Min(0)
//   @Max(255)
//   @IsInt
//   @Column
//   public timesSent: number;

//   @AllowNull(false)
//   @Column(DataType.DATE)
//   public sentAt: string;

//   @AllowNull(false)
//   @Column(DataType.STRING(96))
//   public token: string;

//   @AllowNull(false)
//   @Column(DataType.DATE)
//   public expiresAt: string;
// }
