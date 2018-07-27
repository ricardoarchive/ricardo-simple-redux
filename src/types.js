// @flow
export type NeedsUpdate = (...any) => (state: {}) => boolean

export type ActionParams = { getState: Function, dispatch: Function }

export type ActionRecipe = (...any) => (ActionParams, ...any) => Promise<any> | any

export type ActionNames = {
  success: string,
  error?: string | boolean,
  after?: string | boolean,
  before?: string | boolean,
}

export type AdditionalConfigOptions = {
  before?: false | {},
  after?: false | {},
  error?: false | (({ error: any, ...ActionParams }, ...any) => any),
}

export type ActionConfigType = {
  action: Object | ActionRecipe,
  needsUpdate?: NeedsUpdate,
} & AdditionalConfigOptions

export type Config = { initialState: Object } & AdditionalConfigOptions & ActionParams

export type ActionMeta = { actionNames: ActionNames } & ActionConfigType

export type SRThunkAction = ActionRecipe & { simpleRedux: ActionMeta }
