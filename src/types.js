// @flow
import type { Axios } from 'axios'

export type NeedsUpdate = any => any => boolean

export type ActionRecipe = any => (getState: Function, api: Axios, dispatch: Function) => any

export type actionNames = {
  success: string,
  error: ?(string | boolean),
  after: ?(string | boolean),
  before: ?(string | boolean),
}

export type AdditionalConfigOptions = {
  before: ?(false | {}),
  after: ?(false | {}),
  error: ?(false | ((e: Error) => any)),
}

export type ActionConfigType = {
  action: ActionRecipe,
  needsUpdate: ?NeedsUpdate,
} & AdditionalConfigOptions

export type Config = { initialState: Object } & AdditionalConfigOptions

export type SRThunkAction = {
  $call: ActionRecipe,
  simpleRedux: { actionNames: actionNames } & ActionConfigType,
}
