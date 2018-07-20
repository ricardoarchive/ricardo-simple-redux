// @flow
import 'babel-polyfill'
import type { Axios } from 'axios'
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

  factory = (
    type: string,
    {
      action: actionRecipe,
      error: errorCallback,
      before,
      after,
      needsUpdate: uniqueIdFunction,
    }: ActionConfigType
  ): SRThunkAction => {
    const thunkReadyAction = (...params: any) => {
      // $FlowFixMe
      const action = actionRecipe instanceof Function ? actionRecipe(...params) : () => actionRecipe

      return async (dispatch: Function, getState: Function, api: Axios) => {
        const isUnique = !uniqueIdFunction || uniqueIdFunction(...params)(getState())
        if (!isUnique) return Promise.resolve()
        if (before) dispatch({ update: before, type: `${type}/before` })
        try {
          const update = await action(getState, api, dispatch)
          dispatch({
            type,
            update,
          })
        } catch (error) {
          if (errorCallback) {
            dispatch({ update: errorCallback(error), type: `${type}/error` })
          } else {
            throw error
          }
        }

        if (after) dispatch({ update: after, type: `${type}/after` })
      }
    }

    // To allow cross store actions
    thunkReadyAction.simpleRedux = {
      actionNames: {
        success: `${type}`,
        error: errorCallback && `${type}/error`,
        after: after && `${type}/after`,
        before: before && `${type}/before`,
      },
      action: actionRecipe,
      needsUpdate: uniqueIdFunction,
      error: errorCallback,
      before,
      after,
    }

    return thunkReadyAction
  }

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

  actionFactory = (type: string, config: ActionConfigType): SRThunkAction => {
    const error = config.error !== false ? config.error || this.generic.error : false
    const before = config.before !== false ? config.before || this.generic.before : false
    const after = config.after !== false ? config.after || this.generic.after : false
    const extendedConfig = {
      ...config,
      error,
      before,
      after,
    }
    const doesActionExist = this.actionRegister[type]
    if (doesActionExist) {
      this.throw(`Action ${type} already exists. Action name has to be unique across the app`)
    } else {
      this.actionRegister[type] = true
      if (extendedConfig.before) this.actionRegister[`${type}/before`] = true
      if (extendedConfig.after) this.actionRegister[`${type}/after`] = true
      if (extendedConfig.error) this.actionRegister[`${type}/error`] = true
    }

    return this.factory(type, extendedConfig)
  }
}

export default SimpleRedux
