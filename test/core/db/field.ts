import assert = require('assert');
import Field = require('../../../core/db/field');
import Schema = require('../../../core/db/schema');
import Type = require('../../../core/db/schema/type');

describe('db.field', () => {
  describe('#integer', () => {
    it('create successfully', () => {
      let field = Field.create({ type: Type.integer }, 'integerField');
      assert.equal(field.type(), Type.integer);
      assert.equal(field.name(), 'integerField');
    });
  });

  describe('#float', () => {
    it('create successfully', () => {
      let field = Field.create({ type: Type.float }, 'floatField');
      assert.equal(field.type(), Type.float);
      assert.equal(field.name(), 'floatField');
    });
  });

  describe('#date', () => {
    it('create successfully', () => {
      let field = Field.create({ type: Type.date }, 'dateField');
      assert.equal(field.type(), Type.date);
      assert.equal(field.name(), 'dateField');
    });
  });

  describe('#boolean', () => {
    it('create successfully', () => {
      let field = Field.create({ type: Type.boolean }, 'booleanField');
      assert.equal(field.type(), Type.boolean);
      assert.equal(field.name(), 'booleanField');
    });
  });

  describe('#string', () => {
    it('create successfully', () => {
      let field = Field.create({ type: Type.string }, 'stringField');
      assert.equal(field.type(), Type.string);
      assert.equal(field.name(), 'stringField');
    });
  });

  describe('#array', () => {
    it('create successfully', () => {
      let field = Field.create({ type: Type.array, elementType: { type: Type.integer } }, 'arrayField');
      assert.equal(field.type(), Type.array);
      assert.equal(field.name(), 'arrayField');
    });
  });

  describe('#embedding', () => {
    it('create successfully', () => {
      let integerSchema = new Schema(1, { integerField: { type: Type.integer } });
      let field = Field.create({ type: Type.embedding, schema: integerSchema }, 'embeddingField');
      assert.equal(field.type(), Type.embedding);
      assert.equal(field.name(), 'embeddingField');
    });
  });

  describe('#objectId', () => {
    it('create successfully', () => {
      let field = Field.create({ type: Type.objectId }, 'objectIdField');
      assert.equal(field.type(), Type.objectId);
      assert.equal(field.name(), 'objectIdField');
    });
  });

  describe('#validation', () => {
    it('nullable field pass null', () => {
      let field = Field.create({ type: Type.string, nullable: true }, 'stringField');
      assert.equal(field.type(), Type.string);
      assert.equal(field.name(), 'stringField');

      let result = field.getOrError(null);
      assert.equal(result, null);
    });

    it('field that has default value passes the default value when validating null', () => {
      const defaultValue = 100;
      let field = Field.create({ type: Type.integer, default: defaultValue }, 'integerField');
      assert.equal(field.type(), Type.integer);
      assert.equal(field.name(), 'integerField');

      let result = field.getOrError(null);
      assert.equal(result, defaultValue);
    });

    it('cannot getOrError null if the field is not nullable', () => {
      let field = Field.create({ type: Type.integer, nullable: false }, 'integerField');
      assert.equal(field.type(), Type.integer);
      assert.equal(field.name(), 'integerField');

      assert.throws(
        () => {
          field.getOrError(null);
        },
        (err: Error) => {
          return (err instanceof Error) && err.message === 'integerField field cannot be null. It is not nullable and has no default value.';
        }
      );
    });

    it('default nullable is false', () => {
      let field = Field.create({ type: Type.date }, 'dateField');
      assert.equal(field.type(), Type.date);
      assert.equal(field.name(), 'dateField');

      assert.throws(
        () => {
          field.getOrError(undefined);
        },
        (err: Error) => {
          return (err instanceof Error) && err.message === 'dateField field cannot be undefined. It is not nullable and has no default value.';
        }
      );
    });

    it('cannot pass validation if type is not matched', () => {
      let field = Field.create({ type: Type.date }, 'dateField');
      assert.equal(field.type(), Type.date);
      assert.equal(field.name(), 'dateField');

      assert.throws(
        () => {
          field.getOrError('2014-01-02 03:04:05');
        },
        (err: Error) => {
          return (err instanceof Error) && err.message === 'dateField field cannot be "2014-01-02 03:04:05" (date type expected).';
        }
      );
    });

    it('getOrError returns the min if the value is less than min', () => {
      let minDate = new Date('2015-01-01 01:02:03');
      let field = Field.create({ type: Type.date, min: minDate }, 'dateField');
      assert.equal(field.type(), Type.date);
      assert.equal(field.name(), 'dateField');

      let value = field.getOrError(new Date('2014-01-02 03:04:05'));
      assert.equal(value, minDate);
    });

    it('getOrError returns the max if the value is larger than max', () => {
      let maxFloat = 3.4;
      let field = Field.create({ type: Type.float, max: maxFloat }, 'floatField');
      assert.equal(field.type(), Type.float);
      assert.equal(field.name(), 'floatField');

      let value = field.getOrError(100);
      assert.equal(value, maxFloat);
    });

    it('pass validation if the value is smaller than max', () => {
      let field = Field.create({ type: Type.float, max: 3.4 }, 'floatField');
      assert.equal(field.type(), Type.float);
      assert.equal(field.name(), 'floatField');

      let result = field.getOrError(1);
      assert.equal(result, 1);
    });
  });
});
