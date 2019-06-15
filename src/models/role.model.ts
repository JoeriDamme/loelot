import {
  Association,
  DataTypes,
  HasManyAddAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  Model,
  Sequelize } from 'sequelize';
import User from './user.model';

export default class Role extends Model {
  public static associations: {
    users: Association<User, Role>;
  };

  public static attach(sequelize: Sequelize): void {
    Role.init({
      name: {
        allowNull: false,
        type: DataTypes.STRING(255),
        validate: {
          len: [1, 255],
        },
      },
      permissions: {
        allowNull: false,
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
      uuid: {
        defaultValue: Sequelize.fn('uuid_generate_v4'),
        primaryKey: true,
        type: DataTypes.UUID,
      },
    }, {
      sequelize,
    });
  }

  public static relations(): void {
    Role.hasMany(User, {
      as: 'users',
      foreignKey: 'roleUuid',
      sourceKey: 'uuid',
    });
  }

  public readonly uuid: string;
  public readonly name: string;
  public readonly permissions: string[];
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  public getUsers: HasManyGetAssociationsMixin<User>;
  public addUsers: HasManyAddAssociationMixin<User, number>;
  public hasUser: HasManyHasAssociationMixin<User, number>;
  public countUsers: HasManyCountAssociationsMixin;
  public createUser: HasManyCreateAssociationMixin<User>;
}

// export function init(sequelize: Sequelize): void {
//   Role.init({
//     name: {
//       allowNull: false,
//       type: DataTypes.STRING(255),
//       validate: {
//         len: [1, 255],
//       },
//     },
//     permissions: {
//       allowNull: false,
//       type: DataTypes.ARRAY(DataTypes.STRING),
//     },
//     uuid: {
//       defaultValue: Sequelize.fn('uuid_generate_v4'),
//       primaryKey: true,
//       type: DataTypes.UUID,
//     },
//   }, {
//     sequelize,
//   });
// }
// @Table({
//   timestamps: true,
// })
// export default class Role extends Model<Role> {
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
//   public name: string;

//   @AllowNull(false)
//   @Column(DataType.ARRAY(DataType.STRING))
//   public permissions: string;
// }
