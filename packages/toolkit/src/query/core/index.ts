import { buildCreateApi, CreateApi } from '../createApi'
import { coreModule, coreModuleName } from './module'

const createApi = /* @__PURE__ */ buildCreateApi(coreModule())

export { createApi, coreModule }
