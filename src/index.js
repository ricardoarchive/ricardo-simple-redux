// @flow
import Action from './action'
import type { ActionConfigType, Config, AdditionalConfigOptions, SRThunkAction } from './types'

class SimpleRedux {
  actionRegister = {}
  initialState = {}
  generic: AdditionalConfigOptions = {
    before: false,
    after: false,
    error: false,
  }

  constructor({ initialState, before, after, error }: Config) {
    this.initialState = initialState
    this.generic = { before, after, error }
  }

  reducer = (
    state: Object = this.initialState,
    { update, type }: { update: Object, type: string }
  ) => {
    const updateBelongsToInstance = !!this.actionRegister[type]
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
    const ActionInstance = new Action({
      type,
      config: extendedConfig,
    })
    const { action } = ActionInstance

    return action
  }
}

export default SimpleRedux
