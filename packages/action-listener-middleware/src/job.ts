// Source: https://github.com/ethossoftworks/job-ts

import { Outcome } from './outcome'
import type { Error as OutcomeError } from './outcome'

/**
 * The block of work a [Job] executes. The [job] parameter is a handle of the job's instance to allow
 * launching of new jobs or pausing the job.
 */
export type JobFunc<T> = (job: JobHandle) => Promise<Outcome<T>>

/**
 * A handle for the current job used in [JobFunc]. This interface is equivalent to [Job]'s interface with the exception
 * of [run] and [runWithTimeout] to prevent recursive running of the [Job] inside its [JobFunc].
 */
export interface JobHandle {
  isActive: boolean
  isCompleted: boolean
  isCancelled: boolean
  childCount: number
  ensureActive(): void
  launch<R>(func: JobFunc<R>): Job<R>
  launchAndRun<R>(func: JobFunc<R>): Promise<Outcome<R>>
  pause<R>(func: Promise<R>): Promise<R>
  delay(milliseconds: number): Promise<void>
  cancel(reason?: JobCancellationException): void
  cancelChildren(
    reason?: JobCancellationException,
    skipChildren?: JobHandle[]
  ): void
}

/**
 * Thrown when a job or its parent is cancelled or if a job is run more than once.
 */
export class JobCancellationException implements Error {
  reason: JobCancellationReason
  name: string
  message: string
  constructor(reason: JobCancellationReason) {
    this.name = 'JobCancellationException'
    this.reason = reason
    this.message = `${this.reason}`
  }
}

/**
 * The reason a job was cancelled.
 *
 * [ParentJobCancelled]: The parent job was cancelled
 * [ParentJobCompleted]: The parent job completed
 * [JobCancelled]: The current job was cancelled
 * [JobCompleted]: The current job was already completed. This only happens if the same job is run more than once.
 */
export enum JobCancellationReason {
  ParentJobCancelled = 'ParentJobCancelled',
  ParentJobCompleted = 'ParentJobCompleted',
  JobCancelled = 'JobCancelled',
  JobCompleted = 'JobCompleted',
}

/**
 * A cancellable unit of work with optional cancellation hierarchy.
 *
 * Cancellation is cooperative, meaning the user has to define pause/suspension points in the task via the [pause] or
 * [ensureActive] methods or by checking [isActive].
 *
 * Cancelling a parent Job will cancel all children Jobs launched with the job defined as its parent. All children must
 * also cooperatively check for cancellation.
 *
 * A parent job will not wait for any children jobs unless explicitly awaited on in the provided [JobFunc]. In this
 * instance, if the parent completes before its child has completed, the parent will be marked as completed and the
 * children will be cancelled at the next pause point.
 *
 * If an exception is thrown during a JobFunc, the job will cancel itself and its children and then rethrow the
 * exception to be handled by the user.
 *
 * Running a job more than once will result in a [JobCancellationException].
 *
 * Note: When adding a try/catch mechanism inside of a [JobFunc], make sure to rethrow any [JobCancellationException]
 * exceptions, otherwise job cancellation will not work as intended.
 *
 * Example:
 * ```
 const job = Job(async (job) => {
 *     // This creates a pause point. If the job is cancelled while this operation is running,
 *     // the job will immediately return [Error] with a [JobCancellationException] as its result.
 *     const result = await job.pause(someLongRunningTask());
 *
 *     if (result.error != null) {
 *         return Outcome.error("Problem");
 *     }
 *     return Outcome.ok("All good!");
 * });
 *
 * const jobResult = await job.run();
 * ```
 */
export class Job<T> implements JobHandle {
  private _parent: Job<any> | undefined
  private _children: Job<any>[] = []
  private _func: JobFunc<T>
  private _cancelResolver: (value: Outcome<T>) => void = () => {}
  private _isCancelled = false
  private _isCompleted = false

  private _cancelPromise: Promise<Outcome<T>> = new Promise<Outcome<T>>(
    (resolve) => (this._cancelResolver = resolve)
  )

  constructor(func: JobFunc<T>, options?: { parent?: Job<any> }) {
    this._func = func
    this._parent = options?.parent
    this._parent?._addChild(this)
  }

  /**
   * Returns true if the given outcome was cancelled
   */
  static isCancelled = (
    outcome: Outcome<unknown>
  ): outcome is OutcomeError<JobCancellationException> =>
    outcome.isError() && outcome.error instanceof JobCancellationException

  /**
   * Returns true if both the parent job (if one exists) and the current job are both active. A job is active at
   * creation and remains active until it has completed or been cancelled.
   */
  get isActive(): boolean {
    return (
      !this._isCompleted &&
      !this._isCancelled &&
      (this._parent?.isActive ?? true)
    )
  }

  /**
   * Returns true if the job was completed successfully
   */
  get isCompleted(): boolean {
    return !this.isActive && !this.isCancelled
  }

  /**
   * Returns true if the job was cancelled for any reason, either by explicit invocation of cancel or because its
   * parent was cancelled. This does not imply that the job has fully completed because it may still be finishing
   * whatever it was doing and waiting for its children to complete.
   */
  get isCancelled(): boolean {
    return this._isCancelled || !(this._parent?.isCancelled ?? true)
  }

  /**
   * Checks if the parent job and current job are active and throws [JobCancellationException] if either are inactive.
   *
   * Note: This should only be used inside of a [JobFunc].
   */
  ensureActive() {
    if (this._isCompleted)
      throw new JobCancellationException(JobCancellationReason.JobCompleted)
    if (this._isCancelled)
      throw new JobCancellationException(JobCancellationReason.JobCancelled)

    // Check parent
    if (this._parent === undefined) return
    if (!this._parent.isActive) {
      if (this._parent.isCompleted)
        throw new JobCancellationException(
          JobCancellationReason.ParentJobCompleted
        )
      throw new JobCancellationException(
        JobCancellationReason.ParentJobCancelled
      )
    }
  }

  /**
   * The current number of active children jobs.
   */
  get childCount(): number {
    return this._children.length
  }

  /**
   * Creates and returns a new job with the current job as the parent.
   */
  launch<R>(func: JobFunc<R>): Job<R> {
    return new Job(func, { parent: this })
  }

  /**
   * Creates a new job with the current job as the parent and executes it returning its result.
   *
   * Note: This should only be used inside of a [JobFunc].
   */
  launchAndRun<R>(func: JobFunc<R>): Promise<Outcome<R>> {
    return this.launch(func).run()
  }

  /**
   * Execute the job and return its result.
   *
   * [run] handles all [JobCancellationException] and will return an [Error] if a cancellation occurs.
   */
  async run(): Promise<Outcome<T>> {
    try {
      this.ensureActive()
      const result = this._validateResult(
        await Promise.race([this._func(this), this._cancelPromise])
      )
      this.ensureActive()
      this._isCompleted = true
      return result
    } catch (e) {
      if (e instanceof JobCancellationException) {
        return Outcome.error(e)
      } else {
        this.cancel(
          new JobCancellationException(JobCancellationReason.JobCancelled)
        )
        throw e
      }
    } finally {
      this._parent?._removeChild(this)
    }
  }

  /**
   * Executes the job and cancels the job if it takes longer than the timeout to complete/cancel.
   */
  async runWithTimeout(milliseconds: number): Promise<Outcome<T>> {
    setTimeout(() => this.cancel(), milliseconds)
    return this.run()
  }

  private _validateResult(result: Outcome<T>): Outcome<T> {
    if (result.isError() && result.error instanceof JobCancellationException)
      throw result.error
    return result
  }

  /**
   * Await a given [func] and ensures the job is active before and after [func] execution. This effectively
   * creates a pause/suspend point for the job and prevents returning a result or performing an action on a result
   * if the job has been completed/cancelled.
   *
   * Note: This should only be used inside of a [JobFunc].
   */
  async pause<R>(func: Promise<R>): Promise<R> {
    this.ensureActive()
    const result = await func
    this.ensureActive()
    return result
  }

  /**
   * Delays a job for the specified amount of time and checks for cancellation before and after the delay.
   */
  async delay(milliseconds: number): Promise<void> {
    return await this.pause(
      new Promise((resolve) => setTimeout(resolve, milliseconds))
    )
  }

  /**
   * Cancels the current job and all children jobs.
   */
  cancel(reason?: JobCancellationException) {
    this._parent?._removeChild(this)
    this.cancelChildren(
      new JobCancellationException(JobCancellationReason.ParentJobCancelled)
    )

    if (this._isCancelled || this._isCompleted) return
    this._isCancelled = true
    this._cancelResolver(
      Outcome.error(
        reason ??
          new JobCancellationException(JobCancellationReason.JobCancelled)
      )
    )
  }

  /**
   * Cancels all children jobs without cancelling the current job.
   */
  cancelChildren(
    reason?: JobCancellationException,
    skipChildren: JobHandle[] = []
  ) {
    const childrenCopy = [...this._children]
    const skipSet = new Set(skipChildren)
    const remainingChildren: typeof this._children = []
    childrenCopy.forEach((job) => {
      if (skipSet.has(job)) {
        remainingChildren.push(job)
      } else {
        job.cancel(
          reason ??
            new JobCancellationException(JobCancellationReason.JobCancelled)
        )
      }
    })
    this._children = remainingChildren
  }

  private _addChild(child: Job<any>) {
    if (this.isActive) this._children.push(child)
  }

  private _removeChild(child: Job<any>) {
    this._children.splice(this._children.indexOf(child), 1)
  }
}

/**
 * A helper extension of [Job] that never completes until it is cancelled. This effectively provides a long-running
 * context to launch children jobs in.
 */
export class SupervisorJob extends Job<void> {
  constructor(parent?: Job<any>) {
    super(() => new Promise<Outcome<void>>(() => {}), { parent: parent })
  }
}
