import Sequelize from 'sequelize';
import { AllowNull, Column, DataType, Length, Model, Table } from 'sequelize-typescript';

@Table({
  timestamps: true,
})
export default class Role extends Model<Role> {
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
  public name: string;

  @AllowNull(false)
  @Column(DataType.ARRAY(DataType.STRING))
  public permissions: string;
}
