import expect from 'expect';
import { addTodo, deleteTodo, editTodo, markTodo, markAll, clearMarked } from '../actions/TodoActions';
import * as types from '../constants/ActionTypes';


describe('actions', () => {
  it('returns add todo action type and text', () => {
    const todoText = 'My first TODO'
    const { type, text } = addTodo(todoText);

    expect(type).toEqual(types.ADD_TODO);
    expect(text).toEqual(todoText);
  });

  it('returns delete todo action type and id of deleted todo', () => {
    const todoId = 1;
    const { type, id } = deleteTodo(todoId);

    expect(type).toEqual(types.DELETE_TODO);
    expect(id).toEqual(todoId);
  });

  it('returns edit todo action type, its id and new text', () => {
    const todoId = 1;
    const editedTodo = 'My edited TODO'
    const { type, id, text } = editTodo(todoId, editedTodo);

    expect(type).toEqual(types.EDIT_TODO);
    expect(id).toEqual(todoId);
    expect(text).toEqual(editedTodo);
  });

  it('returns mark todo action type and the id', () => {
    const todoId = 1;
    const { type, id } = markTodo(todoId);

    expect(type).toEqual(types.MARK_TODO);
    expect(id).toEqual(todoId);
  });

  it('returns mark all action type', () => {
    const { type } = markAll();

    expect(type).toEqual(types.MARK_ALL);
  });

  it('returns clear marked action type', () => {
    const { type } = clearMarked();

    expect(type).toEqual(types.CLEAR_MARKED);
  });
});
