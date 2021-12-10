import ts from 'typescript';
import semver from 'semver';

const originalFactory = ts.factory;

function createImportSpecifier(propertyName: ts.Identifier | undefined, name: ts.Identifier): ts.ImportSpecifier {
  if (semver.satisfies(ts.version, '>= 4.5'))
    // @ts-ignore
    return originalFactory.createImportSpecifier(false, propertyName, name);
  // @ts-ignore
  return originalFactory.createImportSpecifier(propertyName, name);
}

function createExportSpecifier(
  propertyName: string | ts.Identifier | undefined,
  name: string | ts.Identifier
): ts.ExportSpecifier {
  if (semver.satisfies(ts.version, '>= 4.5'))
    // @ts-ignore
    return originalFactory.createExportSpecifier(false, propertyName, name);
  // @ts-ignore
  return originalFactory.createExportSpecifier(propertyName, name);
}

export const factory = {
  ...originalFactory,
  createImportSpecifier,
  createExportSpecifier,
};
