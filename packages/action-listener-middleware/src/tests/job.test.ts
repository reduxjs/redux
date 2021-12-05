// Source: https://github.com/ethossoftworks/job-ts/blob/main/src/job.test.ts

import { Outcome } from '../outcome'
import {
  Job,
  JobCancellationException,
  JobCancellationReason,
  SupervisorJob,
} from '../job'

import { performance } from 'perf_hooks'
;(global as any).performance = performance
;(global as any).window = {
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
}

const delay = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

describe('Job', () => {
  test('Cancel when exception thrown', async () => {
    let child: Promise<Outcome<number>> = Promise.resolve(Outcome.ok(1))
    let parent: Job<number> = new Job(async (job) => Outcome.ok(1))

    try {
      parent = new Job(async (job) => {
        child = job.launchAndRun(async (job) => {
          await job.delay(5000)
          return Outcome.ok(1)
        })

        throw new Error('Uh Oh')
        return Outcome.ok(1)
      })
      await parent.run()
    } catch (e) {
      // Ignore parent exception
    } finally {
      const childResult = await child
      if (!parent.isCancelled) throw new Error('Parent was not cancelled')
      if (
        childResult.isOk() ||
        !(childResult.error instanceof JobCancellationException)
      )
        throw new Error('Child was not cancelled')
    }
  })

  test('Add job to cancelled parent', async () => {
    const parent = new Job(async (job) => Outcome.ok(1))
    parent.cancel()

    parent.launch(async (job) => Outcome.ok(1))
    new Job(async (job) => Outcome.ok(1), { parent: parent })
    expect(parent.childCount).toBe(0)
  })

  test('External child cancelled if parent completes', async () => {
    const parentJob = new Job(async (job) => {
      await job.delay(10)
      return Outcome.ok(1)
    })

    const childJob = parentJob.launch(async (job) => {
      await job.delay(50)
      return Outcome.ok(1)
    })

    const parentPromise = parentJob.run()
    const childResult = await childJob.run()
    const parentResult = await parentPromise
    if (parentResult.isError())
      throw new Error('Parent did not complete successfully')
    if (!childResult.isError())
      throw new Error('Child was not cancelled when parent completed')
  })

  test('Job Returns', async () => {
    const job = new Job(async (job) => Outcome.ok(1))
    const value1 = await job.run()

    if (value1.isOk()) {
      expect(value1.value).toBe(1)
    } else {
      throw new Error('Invalid return')
    }

    const value2 = await new Job(async (job) => Outcome.ok(1)).run()
    if (value2.isOk()) {
      expect(value2.value).toBe(1)
    } else {
      throw new Error('Invalid return')
    }
  })

  test('Job Status', async () => {
    const job = new Job(async (job) => Outcome.ok(1))
    expect(job.isActive).toBe(true)
    expect(job.isCompleted).toBe(false)
    expect(job.isCancelled).toBe(false)
    await job.run()
    expect(job.isActive).toBe(false)
    expect(job.isCompleted).toBe(true)
    expect(job.isCancelled).toBe(false)

    const job2 = new Job(async (job) => {
      await job.delay(500)
      return Outcome.ok(1)
    })
    setTimeout(() => job2.cancel(), 100)
    await job2.run()
    expect(job2.isActive).toBe(false)
    expect(job2.isCompleted).toBe(false)
    expect(job2.isCancelled).toBe(true)
  })

  test('Cancellation Reason', async () => {
    // JobCompleted
    const alreadyCompleteJob = new Job(async (job) => Outcome.ok(1))
    await alreadyCompleteJob.run()
    const alreadyCompleteResult = await alreadyCompleteJob.run()
    if (
      alreadyCompleteResult.isOk() ||
      !(alreadyCompleteResult.error instanceof JobCancellationException) ||
      (alreadyCompleteResult.error as JobCancellationException).reason !=
        JobCancellationReason.JobCompleted
    ) {
      throw new Error(
        'Completed: JobCancellationReason.JobCompleted not returned'
      )
    }

    // ParentCancelled
    const parentCancelled = new Job(async (job) => {
      await job.delay(50)
      return Outcome.ok(1)
    })

    const parentCancelledChild = parentCancelled.launch(async (job) => {
      await job.delay(100)
      return Outcome.ok(1)
    })

    setTimeout(() => parentCancelled.cancel(), 25)
    const childResult = await parentCancelledChild.run()

    if (
      childResult.isOk() ||
      !(childResult.error instanceof JobCancellationException) ||
      (childResult.error as JobCancellationException).reason !=
        JobCancellationReason.ParentJobCancelled
    ) {
      throw new Error(
        'Parent Cancelled: JobCancellationReason.ParentJobCancelled not returned'
      )
    }

    // ParentCompleted
    const parentCompleted = new Job(async (job) => {
      await job.delay(10)
      return Outcome.ok(1)
    })
    parentCompleted.run()

    const parentCompletedChild = parentCompleted.launchAndRun(async (job) => {
      await job.delay(20)
      return Outcome.ok(1)
    })

    const parentCompletedChildResult = await parentCompletedChild

    expect(Job.isCancelled(parentCompletedChildResult)).toBe(true)
    // @ts-ignore
    expect(parentCompletedChildResult.error.reason).toBe(
      JobCancellationReason.ParentJobCompleted
    )

    // JobCancelled
    const cancelledJob = new Job(async (job) => {
      await job.delay(50)
      return Outcome.ok(1)
    })

    setTimeout(() => cancelledJob.cancel(), 25)
    const cancelledJobResult = await cancelledJob.run()

    if (
      cancelledJobResult.isOk() ||
      !(cancelledJobResult.error instanceof JobCancellationException) ||
      (cancelledJobResult.error as JobCancellationException).reason !=
        JobCancellationReason.JobCancelled
    ) {
      throw new Error(
        'Job Cancelled: JobCancellationReason.JobCancelled not returned'
      )
    }

    // Launch after parent cancelled
    const launchAfterCancelledJob = new Job(async (job) => Outcome.ok(1))
    launchAfterCancelledJob.cancel()
    const launchAfterCancelledResult =
      await launchAfterCancelledJob.launchAndRun(async (job) => Outcome.ok(1))
    if (
      launchAfterCancelledResult.isOk() ||
      !(launchAfterCancelledResult.error instanceof JobCancellationException) ||
      (launchAfterCancelledResult.error as JobCancellationException).reason !=
        JobCancellationReason.ParentJobCancelled
    ) {
      throw new Error(
        'Launch After Cancelled: JobCancellationReason.ParentJobCancelled not returned'
      )
    }

    // Launch after parent completed
    const launchAfterCompletedJob = new Job(async (job) => Outcome.ok(1))
    await launchAfterCompletedJob.run()
    const launchAfterCompletedResult =
      await launchAfterCompletedJob.launchAndRun(async (job) => Outcome.ok(1))
    if (
      launchAfterCompletedResult.isOk() ||
      !(launchAfterCompletedResult.error instanceof JobCancellationException) ||
      (launchAfterCompletedResult.error as JobCancellationException).reason !=
        JobCancellationReason.ParentJobCompleted
    ) {
      throw new Error(
        'Launch After Completed: JobCancellationReason.ParentJobCompleted not returned'
      )
    }
  })

  test('Multiple Job Runs', async () => {
    const job = new Job(async (job) => {
      await job.delay(50)
      return Outcome.ok(1)
    })

    const result1 = await job.run()
    const result2 = await job.run()
    const result3 = await job.run()

    if (result1.isError() || result1.value !== 1)
      throw new Error('Job did not return value correctly')
    if (result2.isOk() || !(result2.error instanceof JobCancellationException))
      throw new Error('Job did not return JobCompletionException')
    if (result3.isOk() || !(result3.error instanceof JobCancellationException))
      throw new Error('Job did not return JobCompletionException')
  })

  test('Job Parent Cancellation', async () => {
    var childFinished = false

    const parent = new Job(async (job) => {
      await job.launchAndRun(async (job) => {
        await job.delay(100)
        childFinished = true
        return Outcome.ok(1)
      })

      return Outcome.ok(null)
    })

    setTimeout(() => parent.cancel(), 50)
    const result = await parent.run()

    expect(childFinished).toBe(false)
    if (result.isError()) {
      if (!(result.error instanceof JobCancellationException))
        throw new Error(
          'Cancelled exception was not sent back in Outcome.Error'
        )
    } else {
      throw new Error('Outcome.Ok was returned instead of Outcome.Error')
    }

    // Test that child is returned immediately when the parent is cancelled
    const parent2 = new Job(async (job) => {
      await job.delay(25)
      return Outcome.ok(1)
    })

    const child2 = parent2.launch(async (job) => {
      await job.delay(200)
      return Outcome.ok(1)
    })

    setTimeout(() => parent2.cancel(), 20)
    const start = performance.now()
    await child2.run()
    if (performance.now() - start >= 50)
      throw new Error('Child did not cancel immediately')
  })

  test('Job Child Cancellation', async () => {
    const parent = new Job(async (job) => {
      const child1 = job.launch(async (job) => {
        await job.delay(100)
        return Outcome.ok(1)
      })

      const child2 = job.launch(async (job) => {
        await job.delay(50)
        return Outcome.ok(2)
      })

      setTimeout(() => child2.cancel(), 25)
      const results = await Promise.all([child1.run(), child2.run()])

      if (!results[0].isOk() || results[0].value !== 1)
        throw new Error('Child1 not Ok when expected to be')
      if (results[1].isOk()) throw new Error('Child2 not cancelled')
      return Outcome.ok(true)
    })

    const parentResult = await parent.run()
    if (parentResult.isError() || parentResult.value != true)
      throw new Error("Parent didn't complete successfully")
  })

  test('Job Stream', async () => {
    var counter = 0

    await new Job(async (job) => {
      const stream = job.launch(async (job) => {
        for await (const value of _testStream()) {
          job.ensureActive()
          counter = value
        }
        return Outcome.ok(1)
      })

      setTimeout(() => stream.cancel(), 50)
      const streamResult = await stream.run()
      if (streamResult.isOk())
        throw new Error('Stream returned Ok instead of Error')
      return Outcome.ok(null)
    }).run()

    expect(counter < 5).toBe(true)
  })

  test('Job Immediate Cancellation', async () => {
    let childHasRun: boolean = false
    const job = new Job(async (job) => {
      childHasRun = true
      await job.delay(500)
      return Outcome.ok(1)
    })

    job.cancel()
    const result = await job.run()

    if (
      result.isOk() ||
      !(result.error instanceof JobCancellationException) ||
      (childHasRun as boolean) === true
    ) {
      throw new Error(
        `Job was not immediately cancelled. Result: ${result}. HasRun: ${childHasRun}`
      )
    }
  })

  test('Job Cancellation - After Complete', async () => {
    const job = new Job(async (job) => Outcome.ok(1))
    const result = await job.run()
    job.cancel() // Test that this is a noop

    expect(job.isCompleted).toBe(true)
    expect(result.isOk()).toBe(true)
  })

  test('Job Cancellation - Internal', async () => {
    const result = await new Job(async (job) => {
      job.cancel()
      return Outcome.ok(1)
    }).run()

    expect(Job.isCancelled(result)).toBe(true)
  })

  test('Job Timeout', async () => {
    var childHasRun = false

    const result = await new Job(async (job) => {
      await job.launchAndRun(async (job) => {
        await job.delay(100)
        childHasRun = true
        return Outcome.ok(2)
      })

      return Outcome.ok(1)
    }).runWithTimeout(50)

    if (result.isOk() || !(result.error instanceof JobCancellationException)) {
      throw new Error('Job did not timeout appropriately')
    }

    await delay(60)
    if (childHasRun) {
      throw new Error('Timeout did not cancel child')
    }
  })

  test('Job Delay', async () => {
    const start = performance.now()
    const expectedTime = 100
    const result = await new Job(async (job) => {
      await job.delay(expectedTime)
      return Outcome.ok(1)
    }).run()

    const elapsed = performance.now() - start

    if (result.isError() || result.value !== 1) {
      throw new Error('Invalid Result')
    } else if (elapsed < expectedTime) {
      throw new Error('Delay did not work')
    }
  })

  test('Cancel Children', async () => {
    const supervisor = new SupervisorJob()
    var child1Complete = false
    var child2Complete = false

    const child1 = supervisor.launchAndRun(async (job) => {
      await job.delay(120)
      child1Complete = true
      return Outcome.ok(1)
    })

    const child2 = supervisor.launchAndRun(async (job) => {
      await job.delay(100)
      child2Complete = true
      return Outcome.ok(2)
    })

    await delay(25)
    supervisor.cancelChildren()
    const child1Result = await child1
    const child2Result = await child2

    expect(supervisor.isActive).toBe(true)
    expect(child1Complete).toBe(false)
    expect(child2Complete).toBe(false)
    if (
      child1Result.isOk() ||
      !(child1Result.error instanceof JobCancellationException)
    )
      throw new Error('Child 1 did not return exception')
    if (
      child2Result.isOk() ||
      !(child2Result.error instanceof JobCancellationException)
    )
      throw new Error('Child 2 did not return exception')
  })

  test('SupervisorJob - Await', async () => {
    const start = performance.now()
    const supervisor = new SupervisorJob()
    const expectedTime = 200
    await supervisor.runWithTimeout(expectedTime)
    const elapsed = performance.now() - start
    if (elapsed < expectedTime)
      throw new Error(
        `Supervisor Job finished before it was supposed to (${elapsed}, ${expectedTime})`
      )
  })

  test('Child Count', async () => {
    const supervisor = new SupervisorJob()
    var jobs: Promise<Outcome<number>>[] = []

    for (var i = 0; i < 100; i++) {
      jobs.push(
        supervisor.launchAndRun(async (job) => {
          await job.delay(Math.random() * 100)
          return Outcome.ok(1)
        })
      )
    }

    expect(supervisor.childCount).toBe(100)
    await Promise.all(jobs)
    expect(supervisor.childCount).toBe(0)

    const noRunChild = supervisor.launch(async (job) => Outcome.ok(1))
    expect(supervisor.childCount).toBe(1)
    noRunChild.cancel()
    expect(supervisor.childCount).toBe(0)

    const runChild = supervisor.launch(async (job) => {
      await job.delay(50)
      return Outcome.ok(1)
    })
    expect(supervisor.childCount).toBe(1)
    await runChild.run()
    expect(supervisor.childCount).toBe(0)
  })
})

async function* _testStream() {
  var i = 0
  while (true) {
    yield i++
    await delay(10)
  }
}
