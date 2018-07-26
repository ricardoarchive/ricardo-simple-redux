// @flow
export type NeedsUpdate = (...any) => (...any) => boolean

export type ActionParams = { getState: Function, dispatch: Function, ...any }

export type ActionRecipe = (...any) => ActionParams => Promise<any> | any

export type ActionNames = {
  success: string,
  error?: string | boolean,
  after?: string | boolean,
  before?: string | boolean,
}

export type AdditionalConfigOptions = {
  before?: false | {},
  after?: false | {},
  error?: false | (({ error: any, ...ActionParams }) => any),
}

export type ActionConfigType = {
  action: Object | ActionRecipe,
  needsUpdate?: NeedsUpdate,
} & AdditionalConfigOptions

export type Config = {
  initialState: Object,
  getState: Function,
  dispatch: Function,
} & AdditionalConfigOptions &
  ActionParams

export type SRThunkAction = ActionRecipe & {
  simpleRedux: { actionNames: ActionNames } & ActionConfigType,
}
