import expect from 'expect';
import jsdomReact from '../jsdomReact';
import React from 'react/addons';
import Footer from '../../components/Footer';
import { SHOW_ALL, SHOW_ACTIVE } from '../../constants/TodoFilters';

const { TestUtils } = React.addons;

function setup(propOverrides) {
  let props = Object.assign({
    completedCount: 0,
    activeCount: 0,
    filter: SHOW_ALL,
    onClearCompleted: expect.createSpy(),
    onShow: expect.createSpy()
  }, propOverrides);

  let renderer = TestUtils.createRenderer();
  renderer.render(<Footer {...props} />);
  let output = renderer.getRenderOutput();

  return {
    props: props,
    output: output
  };
}

function getTextContent(elem) {
  let children = Array.isArray(elem.props.children) ?
    elem.props.children : [elem.props.children];

  return children.reduce(function concatText(out, child) {
    // Children are either elements or text strings
    return out + (child.props ? getTextContent(child) : child);
  }, '');
}

describe('components', () => {
  jsdomReact();

  describe('Footer', () => {

    it('should render container', () => {
      const { output } = setup();
      expect(output.type).toBe('footer');
      expect(output.props.className).toBe('footer');
    });

    it('should display active count when 0', () => {
      let { output } = setup({ activeCount: 0 });
      let [count] = output.props.children;
      expect(getTextContent(count)).toBe('No items left');
    });

    it('should display active count when above 0', () => {
      let { output } = setup({ activeCount: 1 });
      let [count] = output.props.children;
      expect(getTextContent(count)).toBe('1 item left');
    });

    it('should render filters', () => {
      const { output } = setup();
      let [, filters] = output.props.children;
      expect(filters.type).toBe('ul');
      expect(filters.props.className).toBe('filters');
      expect(filters.props.children.length).toBe(3);
      filters.props.children.forEach(function checkFilter(filter, i) {
        expect(filter.type).toBe('li');
        let a = filter.props.children;
        expect(a.props.className).toBe(i === 0 ? 'selected' : '');
        expect(a.props.children).toBe({
          0: 'All',
          1: 'Active',
          2: 'Completed'
        }[i]);
      });
    });

    it('should call onShow when a filter is clicked', () => {
      const { output, props } = setup();
      let [, filters] = output.props.children;
      let filterLink = filters.props.children[1].props.children;
      filterLink.props.onClick({});
      expect(props.onShow).toHaveBeenCalledWith(SHOW_ACTIVE);
    });

    it('shouldnt show clear button when no completed todos', () => {
      const { output } = setup({ completedCount: 0 });
      let [,, clear] = output.props.children;
      expect(clear).toBe(undefined);
    });

    it('should render clear button when completed todos', () => {
      const { output } = setup({ completedCount: 1 });
      let [,, clear] = output.props.children;
      expect(clear.type).toBe('button');
      expect(clear.props.children).toBe('Clear completed');
    });

    it('should call onClearCompleted on clear button click', () => {
      const { output, props } = setup({ completedCount: 1 });
      let [,, clear] = output.props.children;
      clear.props.onClick({});
      expect(props.onClearCompleted).toHaveBeenCalled();
    });
  });
});

