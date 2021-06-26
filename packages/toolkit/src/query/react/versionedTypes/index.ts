// This file is a dummy. In actual dev, we re-export the hooks type
// here. But, when published, the package.json in this folder will
// point TS to either ts40Types.d.ts or ts41Types.d.ts, and bypass
// index.d.ts completely.
// Overall, this setup allows us to selectively override the one
// file that has any difference between 4.1 and earlier, without
// having to ship two completely duplicate copies of our typedefs.
export { HooksWithUniqueNames } from './ts41Types'
