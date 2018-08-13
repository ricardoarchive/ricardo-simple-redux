// @flow
import type { ActionConfigType, ActionNames, ActionRecipe, ActionMeta } from './types'

class Action {
  dispatch = {}
  config = {}
  type = ''
  constructor({ type, config }: { type: string, config: ActionConfigType }) {
    const { action } = config

    this.config = config
    this.config.action = this.ensureThatActionIsAFunction(action)
    this.type = type

    const actionNames = this.getActionNames(type, config)
    this.dispatch = this.dispatchFactory(config, actionNames)
    this.action.simpleRedux = this.buildActionMetaObject(type, config, actionNames)
  }

  getActionNames = (type: string, { before, after, error }: ActionConfigType) => ({
    before: before && `${type}/before`,
    success: type,
    after: after && `${type}/after`,
    error: error && `${type}/error`,
  })

  buildActionMetaObject = (
    type: string,
    { before, after, action, error, needsUpdate }: ActionConfigType,
    actionNames: ActionNames
  ): ActionMeta => ({ actionNames, action, needsUpdate, error, before, after })

  ensureThatActionIsAFunction = (action: ActionRecipe) =>
    action instanceof Function ? action : () => () => action

  dispatchFactory = (
    { before, action, after, error }: ActionConfigType,
    actionNames: ActionNames
  ) => ({
    before: ({ dispatch }: { dispatch: Function }) => {
      if (before) dispatch({ update: before, type: actionNames.before })
    },
    action: async ({
      getState,
      dispatch,
      thunkParams,
      params,
    }: {
      dispatch: Function,
      getState: Function,
      thunkParams: any,
      params: any,
    }) => {
      // $FlowFixMe in constructor we ensure that if action is an object it will be converted to function which will return that object
      const update = await action(...params)(getState, ...thunkParams, dispatch)
      dispatch({ type: actionNames.success, update })
    },
    after: ({ dispatch }: { dispatch: Function }) => {
      if (after) dispatch({ update: after, type: actionNames.after })
    },
    error: ({
      err,
      dispatch,
      getState,
      thunkParams,
      params,
    }: {
      err: any,
      dispatch: Function,
      getState: Function,
      thunkParams: any,
      params: any,
    }) => {
      if (error) {
        dispatch({
          update: error(err, getState, ...thunkParams, dispatch, params),
          type: actionNames.error,
        })
      } else {
        throw err
      }
    },
  })

  isUnique = (getState: Function, ...params: any) => {
    const { needsUpdate: uniqueIdFunction } = this.config
    return !uniqueIdFunction || uniqueIdFunction(...params)(getState())
  }

  action = (...params: any) => async (
    dispatch: Function,
    getState: Function,
    ...thunkParams: any
  ) => {
    const isUnique = this.isUnique({ ...params }, getState)
    if (!isUnique) return Promise.resolve()
    this.dispatch.before({ dispatch })
    try {
      await this.dispatch.action({ params, getState, dispatch, thunkParams })
    } catch (err) {
      this.dispatch.error({ dispatch, getState, err, params, thunkParams })
    }

    this.dispatch.after({ dispatch })
  }
}

export default Action
