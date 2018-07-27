# ricardo-simple-redux

Reduce amount of boilerplate when building simple actions/reducers

[![wercker status](https://app.wercker.com/status/3e889c000abf9133d8dad2aed855fab3/s/ 'wercker status')](https://app.wercker.com/project/byKey/3e889c000abf9133d8dad2aed855fab3)

# Why SimpleRedux?

Current structure actions + reducers is overcomplex and requires too much bolerplate :wink: .

# Why is it better than what we have today?

1.  Less code === less bugs
2.  Less code === less time needed to code (more time for table soccer)
3.  We can (almost) get rid of action names
4.  More testable

# Installation

`yarn add ricardo-simple-redux`

It requires thunk middleware to be used with Redux

```
const store = reducer => createStore(reducer, applyMiddleware(thunk))
```

# Documentation

```javascript
new SimpleRedux({initialState [, before, after, error]})
```

Constructor parameters:

- `initialState: Object` - this is an initial state it will be used in reducer method
- `before: Object` - optional will be dispatched on the state before the action. Good if you need to display a preloader when you want to call an async action.
- `after: Object` - optional will be dispatched on the state before the action. Good if you need to hide a preloader when you want to call an async action.
- `error: Function` - optional will be dispatched if action will throw an error

```javascirpt
simpleRedux.reducer
```

Generic reducer will dispatch all action added to SimpleState instances on the store

```javascirpt
simpleRedux.actionFactory(type, config)
```

- `type: String` - base action type/name. Subsequent action names will be created automatically if you use `error`, `before` or `after` i.e. if you action name is `get/data` then `get/data/error` will be created automatically if error property is present in the `constructor` or `actionFactory` config

Config parameters:

- `needsUpdate: (...any) => (getState: Function) => boolean` - if function will return `false` action won't be executed. Handy in i.e. `RouteActionComponent` to prevent action infinite loop.
- `action: Object | (...any) => ({ getState: Function, dispatch: Function }, ...any) => Promise<any> | any` - a factory function or update obect. Whatherwer will be returned by action will be automatically dispatched on the store. Available parameters: `{ getState, dispatch }` and all extra params added to thunk
- `before: Object|false` - optional will be dispatched on the state before the action. Good if you need to display a preloader when you want to call an async action. If value is `false` then `before` method from constructor config won't be dispatched.
- `after: Object|false` - optional will be dispatched on the state before the action. Good if you need to hide a preloader when you want to call an async action. If value is `false` then `after` method from constructor config won't be dispatched.
- `error: ({ error: Function, dispatch: Furnction, getState: Function, ...ActionParams:any }) => Object` - optional will be dispatched if action will throw an error. If value is `false` then `error` method from constructor config won't be dispatched.

# Examples

Simple action:

```javascript
const initialState = {}

export const clearState = simpleRedux.actionFactory('component/clear', {
  action: initialState,
})
```

Complex action:

```javascript
export const getData = simpleRedux.actionFactory('component/get', {
  needsUpdate: id => state => state.component.userId !== id,
  before: { load: true },
  after: { load: false },
  error: ({ error, getState, dispatch, id }) => ({ error: error.message }),
  action: (id: number) => async ({ getState, dispatch }, api /* whatever you add to thunk */) => {
    dispatch({ somethingExotic: id }) // if needed ...

    const response = await api.get('url')

    return { ...response.data, id }
  },
})
```

Minimal setup

```javascript
import SimpleRedux from 'ricardo-simple-redux'

const initialState = {}

const simpleRedux = new SimpleRedux({ initialState })

export const clearState = simpleRedux.actionFactory('component/clear', {
  action: initialState,
})

export default const reducer = simpleRedux.reducer
```

Extended setup

```javascript
import SimpleRedux from 'ricardo-simple-redux'

const initialState = {}

const before = { load: true }
const after = { load: false }
const error = ({ error, getState, dispatch, id }) => ({ error: error.toSting() })

const simpleRedux = new SimpleRedux({ initialState, before, after, error })

export const doSomething = simpleRedux.actionFactory('component/clear', {
  action: { something: true },
})

export default const reducer = simpleRedux.reducer
```

# Additional properties of action returned by action factory

(`simpleRedux.actionFactory(/*...*/).simpleRedux`):

```javascript
simpleRedux.actionFactory(/*...*/).simpleRedux = {
  actionNames: {
    success,
    error:,
    after:,
    before:,
  },
  action,
  needsUpdate,
  before,
  after,
  error,
}
```

# Testing outside of redux scope

For testing you might want to export your action config separtately so you don't have to relly on mocking `dispatch` function

```javascript
export const getData = simpleRedux.actionFactory('component/get', {
  needsUpdate: (id: number) => state => state.component.userId !== id,
  before: { load: true },
  after: { load: false },
  error: ({ error, getState, dispatch, id }) => ({ error: error.message }),
  action: (id: number) => async ({ getState, dispatch }, api) => {
    dispatch({ somethingExotic: id }) // if needed ...

    const response = await api.get('url')

    return { ...response.data, id }
  },
})
```

```javascript
import { getData } from './actions'

test('create payment action should complete successfully', async () => {
  const action = getData.simpleRedux.action({
    userId: '123',
    amount: 500,
  })

  const received = await action({ getState }, paymentApi)
  return expect(received).toEqual({ paymentId: 890 })
})
```

# Testing in redux scope

```javascript
test(`should dispatch simple action`, async () => {
  const simpleRedux = new SimpleRedux(defaultConfig)

  const action = simpleRedux.actionFactory('action', {
    action: { update: 2000 },
  })

  const store = createTestStore(simpleRedux.reducer)

  await store.dispatch(action())

  expect(store.getState()).toEqual({ before: true, after: false, test: true, update: 2000 })
})
```
