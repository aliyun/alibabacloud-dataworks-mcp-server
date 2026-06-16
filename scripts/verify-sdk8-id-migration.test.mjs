import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import DataWorksPublic from '@alicloud/dataworks-public20240518';
import {
  isStringIdField,
  shouldUseStringIdType,
  normalizeStringIdValue,
  normalizeInputStringIds,
} from '../build/utils/stringIdFields.js';
import { convertInputSchemaToSchema } from '../build/utils/initDataWorksTools.js';

const LARGE_NODE_ID = '8604388726201130001';
const UNSAFE_INTEGER = 8604388726201130001;

describe('stringIdFields utilities', () => {
  test('identifies Id/id as string id fields', () => {
    assert.equal(isStringIdField('Id'), true);
    assert.equal(isStringIdField('id'), true);
    assert.equal(isStringIdField('ProjectId'), false);
    assert.equal(isStringIdField('TenantId'), false);
  });

  test('shouldUseStringIdType covers Id and int64 format', () => {
    assert.equal(shouldUseStringIdType('Id', undefined), true);
    assert.equal(shouldUseStringIdType('ProjectId', 'int64'), true);
    assert.equal(shouldUseStringIdType('ProjectId', undefined), false);
  });

  test('normalizeStringIdValue converts number and bigint to string', () => {
    assert.equal(normalizeStringIdValue(123), '123');
    assert.equal(normalizeStringIdValue(UNSAFE_INTEGER), String(UNSAFE_INTEGER));
    assert.equal(normalizeStringIdValue(BigInt('8604388726201130001')), '8604388726201130001');
    assert.equal(normalizeStringIdValue(LARGE_NODE_ID), LARGE_NODE_ID);
    assert.equal(normalizeStringIdValue(null), null);
    assert.equal(normalizeStringIdValue(undefined), undefined);
  });

  test('normalizeInputStringIds only converts Id/id keys', () => {
    const input = {
      Id: UNSAFE_INTEGER,
      id: 999,
      ProjectId: 10000,
      Spec: '{"kind":"Node"}',
    };
    const normalized = normalizeInputStringIds(input);
    assert.equal(typeof normalized.Id, 'string');
    assert.equal(normalized.Id, String(UNSAFE_INTEGER));
    assert.equal(normalized.id, '999');
    assert.equal(typeof normalized.ProjectId, 'number');
    assert.equal(normalized.ProjectId, 10000);
    assert.equal(normalized.Spec, input.Spec);
  });
});

describe('UpdateNode schema conversion', () => {
  const updateNodeInputSchema = {
    type: 'object',
    required: ['ProjectId', 'Id'],
    properties: {
      ProjectId: { type: 'integer', description: 'DataWorks工作空间的ID' },
      Id: { type: 'integer', description: '数据开发节点的唯一标识符' },
      Spec: { type: 'string', description: 'node spec json' },
    },
  };

  test('Id accepts string and number then coerces to string', () => {
    const schema = convertInputSchemaToSchema(updateNodeInputSchema);
    assert.equal(schema.parse({ ProjectId: 10000, Id: LARGE_NODE_ID, Spec: '{}' }).Id, LARGE_NODE_ID);
    assert.equal(schema.parse({ ProjectId: 10000, Id: UNSAFE_INTEGER, Spec: '{}' }).Id, String(UNSAFE_INTEGER));
  });

  test('ProjectId remains number', () => {
    const schema = convertInputSchemaToSchema(updateNodeInputSchema);
    const parsed = schema.parse({ ProjectId: 10000, Id: LARGE_NODE_ID, Spec: '{}' });
    assert.equal(typeof parsed.ProjectId, 'number');
    assert.equal(parsed.ProjectId, 10000);
  });
});

describe('DataWorks SDK 8.x compatibility', () => {
  test('UpdateNodeRequest.id is string type', () => {
    const req = new DataWorksPublic.UpdateNodeRequest({
      id: LARGE_NODE_ID,
      projectId: 10000,
      spec: '{}',
    });
    assert.equal(typeof req.id, 'string');
    assert.equal(req.id, LARGE_NODE_ID);
    assert.equal(typeof req.projectId, 'number');
  });

  test('DeleteNodeRequest.id is string type', () => {
    const req = new DataWorksPublic.DeleteNodeRequest({
      id: LARGE_NODE_ID,
      projectId: 10000,
    });
    assert.equal(typeof req.id, 'string');
    assert.equal(req.id, LARGE_NODE_ID);
  });

  test('large node id avoids JS number precision loss', () => {
    const req = new DataWorksPublic.UpdateNodeRequest({ id: LARGE_NODE_ID, projectId: 10000 });
    const asNumber = Number(LARGE_NODE_ID);
    assert.notEqual(String(asNumber), LARGE_NODE_ID);
    assert.equal(req.id, LARGE_NODE_ID);
  });
});

describe('callTool input normalization (RPC query simulation)', () => {
  test('normalized UpdateNode params send Id as string in query', () => {
    const input = normalizeInputStringIds({
      ProjectId: 10000,
      Id: UNSAFE_INTEGER,
      Spec: '{}',
    });

    const query = {};
    for (const key of Object.keys(input)) {
      query[key] = input[key];
    }

    assert.equal(typeof query.Id, 'string');
    assert.equal(query.Id, String(UNSAFE_INTEGER));
    assert.equal(typeof query.ProjectId, 'number');
  });
});
