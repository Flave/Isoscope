import * as d3 from 'd3';
import _ from 'lodash';

export default function SegmentedControl() {
  var parent,
      options,
      segment,
      label,
      selected,
      root,
      rootEnter,
      dispatch = d3.dispatch('change');

  function _control(_parent) {
    parent = _parent;

    root = parent
      .selectAll('div.m-segmented-control')
      .data([1]);

    rootEnter = root
      .enter()
      .append('div')
      .classed('m-segmented-control', true);

    rootEnter
      .append('div')
      .classed('m-ui-control__label', true)
      .text(label);

    segment = root.merge(rootEnter)
      .selectAll('span.m-segmented-control__segment')
      .data(options);

    segment
      .enter()
      .append('span')
      .attr('class', 'm-segmented-control__segment')
      .on('click', function(option) {
        dispatch.call('change', _control, option.value);
      })
      .merge(segment)
      .classed('is-selected', function(option) {
        return option.value === selected;
      })
      .text(function(option) {
        return option.label;
      });

    return _control;
  }

  _control.options = function(_) {
    if(!arguments.length) return options;
    options = _;
    return _control;
  }

  _control.selected = function(_) {
    if(!arguments.length) return selected;
    selected = _;
    return _control;
  }

  _control.label = function(_) {
    if(!arguments.length) return label;
    label = _;
    return _control;
  }

  return d3.rebind(_control, dispatch, 'on');
}