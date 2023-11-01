import SwaggerParser from '@apidevtools/swagger-parser';
// @ts-ignore
import converter from 'swagger2openapi';

import type { OpenAPIV3 } from 'openapi-types';

export async function getV3Doc(spec: string): Promise<OpenAPIV3.Document> {
  const doc = await SwaggerParser.bundle(spec);
  const isOpenApiV3 = 'openapi' in doc && doc.openapi.startsWith('3');
  if (isOpenApiV3) {
    return doc as OpenAPIV3.Document;
  } else {
    const result = await converter.convertObj(doc, {});
    return result.openapi as OpenAPIV3.Document;
  }
}
