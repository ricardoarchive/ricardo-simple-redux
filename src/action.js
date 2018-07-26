// @flow
import type { ActionConfigType, ActionNames, Config } from './types'

class Action {
  constructor({
    type,
    config,
    actionNames,
    simpleReduxConfig,
  }: {
    type: string,
    config: ActionConfigType,
    actionNames: ActionNames,
    simpleReduxConfig: Config,
  }) {
    this.config = config
    const { action } = config
    this.config.action = this.ensureThatActionIsAFunction(action)
    this.type = type
    this.actionNames = actionNames
    this.dispatch = this.dispatchFactory(simpleReduxConfig, config, actionNames)
  }

  ensureThatActionIsAFunction = action => (action instanceof Function ? action : () => () => action)

  dispatchFactory = (
    { getState, dispatch, rest }: Config,
    { before, action, after, error }: ActionConfigType,
    actionNames: ActionNames
  ) => ({
    before: () => {
      if (before) dispatch({ update: before, type: this.actionNames.before })
    },
    action: async (...params) => {
      const update = await action(...params)({ getState, dispatch, ...rest })
      dispatch({
        type: actionNames.success,
        update,
      })
    },
    after: () => {
      if (after) dispatch({ update: after, type: actionNames.after })
    },
    error: err => {
      if (error) {
        dispatch({ update: error({ err, getState, dispatch, ...rest }), type: actionNames.error })
      } else {
        throw err
      }
    },
  })

  isUnique = (...params) => {
    const { needsUpdate: uniqueIdFunction, getState } = this.config
    return !uniqueIdFunction || uniqueIdFunction(...params)(getState())
  }

  action = (...params: any) => {
    return async () => {
      const isUnique = this.isUnique(...params)
      if (!isUnique) return Promise.resolve()
      this.dispatch.before()
      try {
        await this.dispatch.action(...params)
      } catch (err) {
        this.dispatch.error(err)
      }

      this.dispatch.after()
    }
  }
}

export default Action
