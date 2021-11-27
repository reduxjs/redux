import * as ts from 'typescript';
import type { OpenAPIV3 } from 'openapi-types';

export type OperationDefinition = {
  path: string;
  verb: typeof operationKeys[number];
  pathItem: OpenAPIV3.PathItemObject;
  operation: OpenAPIV3.OperationObject;
};

type Require<T, K extends keyof T> = { [k in K]-?: NonNullable<T[k]> } & Omit<T, K>;
type Optional<T, K extends keyof T> = { [k in K]?: NonNullable<T[k]> } & Omit<T, K>;
type Id<T> = { [K in keyof T]: T[K] } & {};

export const operationKeys = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'] as const;

export type GenerationOptions = Id<
  CommonOptions &
    Optional<OutputFileOptions, 'outputFile'> & {
      isDataResponse?(
        code: string,
        response: OpenAPIV3.ResponseObject,
        allResponses: OpenAPIV3.ResponsesObject
      ): boolean;
    }
>;

export interface CommonOptions {
  apiFile: string;
  /**
   * filename or url
   */
  schemaFile: string;
  /**
   * defaults to "api"
   */
  apiImport?: string;
  /**
   * defaults to "enhancedApi"
   */
  exportName?: string;
  /**
   * defaults to "ApiArg"
   */
  argSuffix?: string;
  /**
   * defaults to "ApiResponse"
   */
  responseSuffix?: string;
  /**
   * defaults to false
   */
  hooks?: boolean;
}

export type TextMatcher = string | RegExp | (string | RegExp)[];

export type EndpointMatcherFunction = (operationName: string, operationDefinition: OperationDefinition) => boolean;

export type EndpointMatcher = TextMatcher | EndpointMatcherFunction;

export interface OutputFileOptions extends Partial<CommonOptions> {
  outputFile: string;
  filterEndpoints?: EndpointMatcher;
  endpointOverrides?: EndpointOverrides[];
}

export interface EndpointOverrides {
  pattern: EndpointMatcher;
  type: 'mutation' | 'query';
}

export type ConfigFile =
  | Id<Require<CommonOptions & OutputFileOptions, 'outputFile'>>
  | Id<
      Omit<CommonOptions, 'outputFile'> & {
        outputFiles: { [outputFile: string]: Omit<OutputFileOptions, 'outputFile'> };
      }
    >;
