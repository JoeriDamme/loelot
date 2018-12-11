import { expect } from 'chai';
import SequelizeUtility from '../../../../src/lib/sequelize-utility';

const mockRawAttributes: any = {
  createdAt: {
    _autoGenerated: true, // not mandatory
  },
  description: {
    allowNull: false, // mandatory!
  },
  name: {
    allowNull: true, // not mandatory
  },
  nameNl: {
    allowNull: false, // mandatory! (read-only field for example, so not bene set by body but business logic)
  },
  uuid: {
    primaryKey: true, // not mandatory
  },
  zork: {
    allowNull: false, // mandatory!
  },
};

const mockModel: any = {
  rawAttributes: mockRawAttributes,
};

describe('src/lib/sequelize-utility', () => {
  describe('SequelizeUtility.getMissingMandatoryAttributes()', () => {
    it('should return true if mandatory properties are all set', () => {
      const result: string[] = SequelizeUtility.getMissingMandatoryAttributes(mockModel,
        ['description', 'zork', 'nameNl', 'name', 'uuid']);
      expect(result).to.be.empty;
    });

    it('should return true if properties are all set except where it can be null in database', () => {
      const result: string[] = SequelizeUtility.getMissingMandatoryAttributes(mockModel,
        ['description', 'nameNl', 'zork']);
      expect(result).to.be.empty;
    });

    it('should return false if mandatory property is not set', () => {
      const result: string[] = SequelizeUtility.getMissingMandatoryAttributes(mockModel, ['description', 'nameNl']);
      expect(result).to.deep.equal(['zork']);
    });

    it('should return true if mandatory properties are set including a fake property', () => {
      const result: string[] = SequelizeUtility.getMissingMandatoryAttributes(mockModel,
        ['description', 'zork', 'nameNl', 'name', 'uuid', 'fake']);
      expect(result).to.be.empty;
    });

    it('should return true if mandatory properties are all set with exception on 1', () => {
      const result: string[] = SequelizeUtility.getMissingMandatoryAttributes(mockModel,
        ['description', 'zork'], ['nameNl']);
      expect(result).to.be.empty;
    });
  });
});