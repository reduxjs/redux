import expect from 'expect';
import todos from '../stores/todos';
import { ADD_TODO, DELETE_TODO, EDIT_TODO, MARK_TODO, MARK_ALL, CLEAR_MARKED } from '../constants/ActionTypes';

describe('stores', () => {

  describe('todos', () => {

    let initialState;

    beforeEach(() => {
      initialState = [{
        text: 'Use Redux',
        marked: false,
        id: 0
      }];
    });

    it('adds a new todo', () => {
      const todoText = 'My TODO';
      const action = {
        type: ADD_TODO,
        text: todoText
      };

      const state = todos(initialState, action);

      expect(state.length).toEqual(2);
      expect(state[0].text).toEqual(todoText);
      expect(state[0].marked).toEqual(false);
      expect(state[0].id).toEqual(state[1].id + 1);
    });

    it('deletes todo', () => {
      const todoId = 0;
      const action = {
        type: DELETE_TODO,
        id: todoId
      };

      const state = todos(initialState, action);

      expect(state.length).toEqual(0);
    });

    it('edits todo', () => {
      const todoId = 0;
      const todoText = 'My TODO';
      const action = {
        type: EDIT_TODO,
        id: todoId,
        text: todoText
      };

      const state = todos(initialState, action);

      expect(state.length).toEqual(1);
      expect(state[0].text).toEqual(todoText);
      expect(state[0].marked).toEqual(false);
    });

    it('marks todo', () => {
      const todoId = 0;
      const action = {
        type: MARK_TODO,
        id: todoId
      };

      const state = todos(initialState, action);

      expect(state.length).toEqual(1);
      expect(state[0].marked).toEqual(true);
    });

    it('marks all todos', () => {
      const newState = [{
        text: 'Use Redux',
        marked: false,
        id: 1
      }, {
        text: 'Write tests',
        marked: false,
        id: 0
      }];

      const action = {
        type: MARK_ALL
      };

      const state = todos(newState, action);

      expect(state.length).toEqual(2);
      expect(state[0].marked).toEqual(true);
      expect(state[1].marked).toEqual(true);
    });

    it('clears all marked todos', () => {
      const newState = [{
        text: 'Use Redux-DevTools',
        marked: true,
        id: 2
      }, {
        text: 'Use Redux',
        marked: true,
        id: 1
      }, {
        text: 'Write tests',
        marked: false,
        id: 0
      }];

      const action = {
        type: CLEAR_MARKED
      };

      const state = todos(newState, action);

      expect(state.length).toEqual(1);
      expect(state[0].marked).toEqual(false);
    });

    it('returns the state by default', () => {
      const action = {
        type: null
      };

      const state = todos(initialState, action);

      expect(state).toEqual(initialState);
    });
  });
});
