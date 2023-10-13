import * as React from 'react'
import { createApi, ApiProvider } from '@reduxjs/toolkit/query/react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { waitMs } from './helpers'

const api = createApi({
  baseQuery: async (arg: any) => {
    await waitMs()
    return { data: arg?.body ? arg.body : null }
  },
  endpoints: (build) => ({
    getUser: build.query<any, number>({
      query: (arg) => arg,
    }),
    updateUser: build.mutation<any, { name: string }>({
      query: (update) => ({ body: update }),
    }),
  }),
})

describe('ApiProvider', () => {
  test('ApiProvider allows a user to make queries without a traditional Redux setup', async () => {
    function User() {
      const [value, setValue] = React.useState(0)

      const { isFetching } = api.endpoints.getUser.useQuery(1, {
        skip: value < 1,
      })

      return (
        <div>
          <div data-testid="isFetching">{String(isFetching)}</div>
          <button onClick={() => setValue((val) => val + 1)}>
            Increment value
          </button>
        </div>
      )
    }

    const { getByText, getByTestId } = render(
      <ApiProvider api={api}>
        <User />
      </ApiProvider>
    )

    await waitFor(() =>
      expect(getByTestId('isFetching').textContent).toBe('false')
    )
    fireEvent.click(getByText('Increment value'))
    await waitFor(() =>
      expect(getByTestId('isFetching').textContent).toBe('true')
    )
    await waitFor(() =>
      expect(getByTestId('isFetching').textContent).toBe('false')
    )
    fireEvent.click(getByText('Increment value'))
    // Being that nothing has changed in the args, this should never fire.
    expect(getByTestId('isFetching').textContent).toBe('false')
  })
})
