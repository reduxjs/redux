import { configureStore } from '../configureStore'
import { createSlice } from '../createSlice'
import {
  autoBatchEnhancer,
  prepareAutoBatched,
  AutoBatchOptions,
} from '../autoBatchEnhancer'
import { delay } from '../utils'
import { debounce } from 'lodash'

interface CounterState {
  value: number
}

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 } as CounterState,
  reducers: {
    incrementBatched: {
      // Batched, low-priority
      reducer(state) {
        state.value += 1
      },
      prepare: prepareAutoBatched<void>(),
    },
    // Not batched, normal priority
    decrementUnbatched(state) {
      state.value -= 1
    },
  },
})
const { incrementBatched, decrementUnbatched } = counterSlice.actions

const makeStore = (autoBatchOptions?: AutoBatchOptions) => {
  return configureStore({
    reducer: counterSlice.reducer,
    enhancers: (existingEnhancers) => {
      return existingEnhancers.concat(autoBatchEnhancer(autoBatchOptions))
    },
  })
}

let store: ReturnType<typeof makeStore>

let subscriptionNotifications = 0

const cases: AutoBatchOptions[] = [
  { type: 'tick' },
  { type: 'raf' },
  { type: 'timer', timeout: 0 },
  { type: 'timer', timeout: 10 },
  { type: 'timer', timeout: 20 },
  {
    type: 'callback',
    queueNotification: debounce((notify: () => void) => {
      notify()
    }, 5),
  },
]

describe.each(cases)('autoBatchEnhancer: %j', (autoBatchOptions) => {
  beforeEach(() => {
    subscriptionNotifications = 0
    store = makeStore(autoBatchOptions)

    store.subscribe(() => {
      subscriptionNotifications++
    })
  })
  test('Does not alter normal subscription notification behavior', async () => {
    store.dispatch(decrementUnbatched())
    expect(subscriptionNotifications).toBe(1)
    store.dispatch(decrementUnbatched())
    expect(subscriptionNotifications).toBe(2)
    store.dispatch(decrementUnbatched())
    expect(subscriptionNotifications).toBe(3)
    store.dispatch(decrementUnbatched())

    await delay(25)

    expect(subscriptionNotifications).toBe(4)
  })

  test('Only notifies once if several batched actions are dispatched in a row', async () => {
    store.dispatch(incrementBatched())
    expect(subscriptionNotifications).toBe(0)
    store.dispatch(incrementBatched())
    expect(subscriptionNotifications).toBe(0)
    store.dispatch(incrementBatched())
    expect(subscriptionNotifications).toBe(0)
    store.dispatch(incrementBatched())

    await delay(25)

    expect(subscriptionNotifications).toBe(1)
  })

  test('Notifies immediately if a non-batched action is dispatched', async () => {
    store.dispatch(incrementBatched())
    expect(subscriptionNotifications).toBe(0)
    store.dispatch(incrementBatched())
    expect(subscriptionNotifications).toBe(0)
    store.dispatch(decrementUnbatched())
    expect(subscriptionNotifications).toBe(1)
    store.dispatch(incrementBatched())

    await delay(25)

    expect(subscriptionNotifications).toBe(2)
  })

  test('Does not notify at end of tick if last action was normal priority', async () => {
    store.dispatch(incrementBatched())
    expect(subscriptionNotifications).toBe(0)
    store.dispatch(incrementBatched())
    expect(subscriptionNotifications).toBe(0)
    store.dispatch(decrementUnbatched())
    expect(subscriptionNotifications).toBe(1)
    store.dispatch(incrementBatched())
    store.dispatch(decrementUnbatched())
    expect(subscriptionNotifications).toBe(2)
    store.dispatch(decrementUnbatched())
    expect(subscriptionNotifications).toBe(3)

    await delay(25)

    expect(subscriptionNotifications).toBe(3)
  })
})
