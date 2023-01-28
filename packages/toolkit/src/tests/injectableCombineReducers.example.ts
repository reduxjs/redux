/* eslint-disable import/first */
// @ts-nocheck

// reducer.ts or whatever

import { combineSlices } from '@reduxjs/toolkit'

import { sliceA } from 'fileA'
import { sliceB } from 'fileB'
import { lazySliceC } from 'fileC'
import type { lazySliceD } from 'fileD'

import { anotherReducer } from 'somewhere'

export interface LazyLoadedSlices {}

export const rootReducer = combineSlices(sliceA, sliceB, {
  another: anotherReducer,
}).withLazyLoadedSlices<LazyLoadedSlices>()
/*
 results in a return type of
 {
    [sliceA.name]: SliceAState,
    [sliceB.name]: SliceBState,
    another: AnotherState,
    [lazySliceC.name]?: SliceCState, // see fileC.ts to understand why this appears here
    [lazySliceD.name]?: SliceDState, // see fileD.ts to understand why this appears here
 }
 */

// fileC.ts
// "naive" approach

import type { RootState } from './reducer';
import { rootReducer } from './reducer'
import { createSlice } from '@reduxjs/toolkit'

interface SliceCState {
  foo: string
}

declare module './reducer' {
  export interface LazyLoadedSlices {
    [lazySliceC.name]: SliceCState
  }
}

export const lazySliceC = createSlice({
  /* ... */
})
/**
 * Synchronously call `injectSlice` in file.
 */
rootReducer.injectSlice(lazySliceC)

// might want to add code for HMR as well here

// this will still error - `lazySliceC` is optional here
const naiveSelectFoo = (state: RootState) => state.lazySliceC.foo

const selectFoo = rootReducer.withSlice(lazySliceC).selector((state) => {
  // `lazySlice` is guaranteed to not be `undefined` here.
  return state.lazySlice.foo
})
