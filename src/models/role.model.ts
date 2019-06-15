import { DataTypes, Model, Sequelize } from 'sequelize';

export default class Role extends Model {
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

  public uuid: string;
  public name: string;
  public permissions: string[];
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
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
