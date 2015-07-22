import expect from 'expect';
import * as types from '../../constants/ActionTypes';
import * as actions from '../../actions/TodoActions';

describe('todo actions', () => {

  it('addTodo should create ADD_TODO action', () => {
    expect(actions.addTodo('Use Redux')).toEqual({
      type: types.ADD_TODO,
      text: 'Use Redux'
    });
  });

  it('deleteTodo should create DELETE_TODO action', () => {
    expect(actions.deleteTodo(1)).toEqual({
      type: types.DELETE_TODO,
      id: 1
    });
  });

  it('editTodo should create EDIT_TODO action', () => {
    expect(actions.editTodo(1, 'Use Redux everywhere')).toEqual({
      type: types.EDIT_TODO,
      id: 1,
      text: 'Use Redux everywhere'
    });
  });

  it('markTodo should create MARK_TODO action', () => {
    expect(actions.markTodo(1)).toEqual({
      type: types.MARK_TODO,
      id: 1
    });
  });

  it('markAll should create MARK_ALL action', () => {
    expect(actions.markAll()).toEqual({
      type: types.MARK_ALL
    });
  });

  it('clearMarked should create CLEAR_MARKED action', () => {
    expect(actions.clearMarked('Use Redux')).toEqual({
      type: types.CLEAR_MARKED
    });
  });
});

