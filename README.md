# ricardo-simple-redux

Reduce amount of boilerplate when building simple actions/reducers

# Why SimpleRedux?

It takes way too much time and code to build a simple service (let's call it action :wink: ) which gets a bunch of data from an API and updates a state with data. Thanks to SimpleRedux, the number of lines of code needed to achieve above dropped by ~60% and number of files is reduced by ~50% :wink: .

# Why is it not an redux plugin?

SimpleRedux gives us flexibility to use it when it's handy and doesn't require to rewrite all actions in order to make use of it.

# Why is it better than what we have today?

1.  Less code === less bugs
2.  Less code === less time needed to code (more time for table soccer)
3.  I love abstractions which makes complex code simple
4.  We can (almost) get rid of action names
5.  Shorter development time

# Installation

`yarn add ricardo-simple-redux`

# Release

To release new verion of package
`yarn npm:publish`

# A bit of documentation

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

- `needsUpdate: Function => boolean` - if function will return `false` action won't be executed. Handy in i.e. `RouteActionComponent` to prevent action infinite loop.
- `action: Function|Object` - a factory function or update obect. Whatherwer will be returned by action will be automatically dispatched on the store. Available parameters: `getState, api, dispatch`
- `before: Object|false` - optional will be dispatched on the state before the action. Good if you need to display a preloader when you want to call an async action. If value is `false` then `before` method from constructor config won't be dispatched.
- `after: Object|false` - optional will be dispatched on the state before the action. Good if you need to hide a preloader when you want to call an async action. If value is `false` then `after` method from constructor config won't be dispatched.
- `error: Function` - optional will be dispatched if action will throw an error. If value is `false` then `error` method from constructor config won't be dispatched.

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
  needsUpdate: (id: number) => state => state.component.userId !== id,
  before: { load: true },
  after: { load: false },
  error: e => ({ error: error.message }),
  action: (id: number) => async (getState: Function, api: Axios, dispatch: Function) => {
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
const error = err => ({ error: error.toSting() })

const simpleRedux = new SimpleRedux({ initialState, before, after, error })

export const doSomething = simpleRedux.actionFactory('component/clear', {
  action: { something: true },
})

export default const reducer = simpleRedux.reducer
```

# Additional properties of action returned by action factory:

```javascript
export type SRThunkAction = {
  (): void,
  actionNames: {
    success: string,
    error?: string,
    after?: string,
    before?: string,
  },
  action: () => () => {},
  needsUpdate?: () => boolean,
  before?: {},
  after?: {},
  error?: () => Object,
}
```

# Testing outside of redux scope

For testing you might want to export your action config separtately so you don't have to relly on mocking `dispatch` function

```javascript
export const getData = simpleRedux.actionFactory('component/get', {
  needsUpdate: (id: number) => state => state.component.userId !== id,
  before: { load: true },
  after: { load: false },
  error: e => ({ error: error.message }),
  action: (id: number) => async (getState: Function, api: Axios, dispatch: Function) => {
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
    paymentMethod: 'bank-transfer-bank',
    comment: '12341234',
  })

  const received = await action(getState, paymentApi)
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
