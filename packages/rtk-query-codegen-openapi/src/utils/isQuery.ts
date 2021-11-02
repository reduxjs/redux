import type { EndpointOverrides, operationKeys } from '../types';

export function isQuery(verb: typeof operationKeys[number], overrides: EndpointOverrides | undefined) {
  if (overrides?.type) {
    return overrides.type === 'query';
  }
  return verb === 'get';
}
