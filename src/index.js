import 'babel-polyfill'
import Action from './action'
import type {
  ActionConfigType,
  Config,
  AdditionalConfigOptions,
  SRThunkAction,
  ActionNames,
} from './types'

class SimpleRedux {
  actionRegister = {}
  initialState = {}
  generic: AdditionalConfigOptions = {
    before: false,
    after: false,
    error: false,
  }

  constructor({ initialState, before, after, error, getState, dispatch, ...rest }: Config) {
    this.initialState = initialState
    this.generic = { before, after, error, getState, dispatch, rest }
  }

  buildActionMetaObject = (
    type: string,
    { before, after, action, error, needsUpdate }: ActionConfigType,
    actionNames: ActionNames
  ) => ({
    actionNames,
    action,
    needsUpdate,
    error,
    before,
    after,
  })

  getActionNames = (type: string, { before, after, action, error }: ActionConfigType) => ({
    before: before && `${type}/before`,
    success: type,
    after: after && `${type}/after`,
    error: error && `${type}/error`,
  })

  reducer = (
    state: Object = this.initialState,
    { update, type }: { update: Object, type: string }
  ) => {
    const updateBelongsToInstance = this.actionRegister[type]
    if (!updateBelongsToInstance || !update) return state
    return {
      ...state,
      ...update,
    }
  }

  throw = (message: string) => {
    throw new Error(message)
  }

  extendConfig = (config: ActionConfigType): ActionConfigType => {
    const error = config.error !== false ? config.error || this.generic.error : false
    const before = config.before !== false ? config.before || this.generic.before : false
    const after = config.after !== false ? config.after || this.generic.after : false
    return {
      ...config,
      error,
      before,
      after,
    }
  }

  registerActions = (extendedConfig: ActionConfigType, type: string) => {
    this.actionRegister[type] = true
    if (extendedConfig.before) this.actionRegister[`${type}/before`] = true
    if (extendedConfig.after) this.actionRegister[`${type}/after`] = true
    if (extendedConfig.error) this.actionRegister[`${type}/error`] = true
  }

  actionFactory = (type: string, config: ActionConfigType): SRThunkAction => {
    const extendedConfig = this.extendConfig(config)
    const doesActionExist = this.actionRegister[type]

    if (doesActionExist) {
      this.throw(`Action ${type} already exists. Action name has to be unique across the app`)
    }
    this.registerActions(extendedConfig, type)

    const actionNames = this.getActionNames(type, extendedConfig)
    const actionMetaData = this.buildActionMetaObject(type, extendedConfig, actionNames)
    const ActionInstance = new Action({
      type,
      config: extendedConfig,
      actionNames,
      simpleReduxConfig: this.generic,
    })
    const action = ActionInstance.action

    action.simpleRedux = actionMetaData

    return action
  }
}

export default SimpleRedux
