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

export default class WishList extends Model {
  public static associations: {
    group: Association<Group, WishList>;
    creator: Association<User, WishList>;
  };

  public static attach(sequelize: Sequelize): void {
    WishList.init({
      creatorUuid: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      description: {
        allowNull: false,
        type: DataTypes.TEXT(),
        validate: {
          len: [1, 512],
        },
      },
      groupUuid: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      rank: {
        allowNull: false,
        type: DataTypes.INTEGER(),
        validate: {
          isInt: true,
          max: 255,
          min: 1,
        },
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
          delete instance.attributes.groupUuid;
          delete instance.attributes.creatorUuid;
          return;
        },
      },
      sequelize,
    });
  }

  public static relations(): void {
    WishList.belongsTo(Group, {
      as: 'group',
      foreignKey: 'groupUuid',
      targetKey: 'uuid',
    });

    WishList.belongsTo(User, {
      as: 'creator',
      foreignKey: 'creatorUuid',
      targetKey: 'uuid',
    });
  }

  public uuid: string;
  public creatorUuid: string;
  public description: string;
  public groupUuid: string;
  public rank: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  public getGroup: BelongsToGetAssociationMixin<Group>;
  public createGroup: BelongsToCreateAssociationMixin<Group>;

  public getCreator: BelongsToGetAssociationMixin<User>;
  public createCreator: BelongsToCreateAssociationMixin<User>;
}

// @Table({
//   timestamps: true,
// })
// export default class WishList extends Model<WishList> {
//   @BeforeBulkUpdate
//   public static removeReadOnly(instance: any): void {
//     delete instance.attributes.uuid;
//     delete instance.attributes.groupUuid;
//     delete instance.attributes.creatorUuid;
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

//   @Length({
//     max: 512,
//     min: 1,
//   })
//   @AllowNull(false)
//   @Column(DataType.TEXT)
//   public description: string;

//   @Min(0)
//   @Max(255)
//   @IsInt
//   @AllowNull(false)
//   @Column(DataType.INTEGER)
//   public rank: number;
// }
