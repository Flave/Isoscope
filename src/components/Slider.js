import * as d3 from 'd3';
import _ from 'lodash';

export default function Slider() {
  var parent,
      max = 30,
      min = 0,
      root,
      rootEnter,
      input,
      inputEnter,
      value,
      valueElement,
      valueElementEnter,
      label,
      valueFormatter,
      labelElement,
      dispatch = d3.dispatch('change', 'input');

  function _slider(_parent) {
    parent = _parent;

    root = parent
      .selectAll('div.m-slider')
      .data([1]);

    rootEnter = root
      .enter()
      .append('div')
      .classed('m-slider', true);

    // LABEL
    labelElement = rootEnter
      .selectAll('div.m-ui-control__label')
      .data([1]);

    labelElement.enter()
      .append('div')
      .attr('class', 'm-ui-control__label')
      .text(label);

    // VALUE
    valueElement = root.merge(rootEnter)
      .selectAll('div.m-slider__value')
      .data([1]);

    valueElement.enter()
      .append('div')
      .attr('class', 'm-slider__value')
      .merge(valueElement)
      .text(valueFormatter ? valueFormatter(value) : value);

    /*createLineChart();*/


    input = root.merge(rootEnter)
      .selectAll('input.m-slider__input')
      .data([1]);

    inputEnter = input.enter()
      .append('input')
      .attr('type', 'range')
      .attr('class', 'm-slider__input')
      .merge(input)
      .attr('max', max)
      .attr('min', min)
      .attr('value', value)
      .on('change', function() {
        dispatch.call('change', _slider, d3.event.target.valueAsNumber);
      })
      .on('input', function() {
        dispatch.call('input', _slider, d3.event.target.valueAsNumber);
      });

    return _slider;
  }

  function createLineChart() {
    var chart, chartEnter, group, groupEnter, line, lineEnter, dot, dotEnter, extent, indexToX, valueToY, margin, height, width, chartHeight;
    margin = {top: 5, right: 0, bottom: 5, left: 0};
    height = 30;
    width = 240;
    chartHeight = height - margin.top - margin.bottom;

    var data = _.map(_.range(24), function(i) {
      var returnUndefined = Math.random() > .3 ? true : false;
      return returnUndefined ? undefined : Math.random();
    });

    indexToX = d3.scaleLinear().domain([0, data.length]).range([0, width]);
    valueToY = d3.scaleLinear().domain(d3.extent(data)).range([0, chartHeight]);

    chart = root.merge(rootEnter)
      .selectAll('svg.m-slider__chart')
      .data([1]);

    chartEnter = chart.enter()
      .append('svg')
      .attr('width', 390)
      .attr('height', 30)
      .classed('m-slider__chart', true);

    group = chart.merge(chartEnter)
      .selectAll('g.m-slider__chart-group')
      .data([1]);

    groupEnter = group.enter()
      .append('g')
      .classed('m-slider__chart-group', true)
      .attr('transform', `translate(${margin.left},${margin.top})`);

    dot = group.merge(groupEnter)
      .selectAll('circle.m-slider__chart-dot')
      .data(data);

    dot.exit().remove();

    dotEnter = dot.enter()
      .append('circle')
      .attr('r', 2)
      .attr('cx', function(d, i) {
        return indexToX(i);
      })
      .attr('cy', function(d, i) {
        return d === undefined ? 0 : chartHeight - indexToX(d);
      });

    dotEnter.merge(dot)
      .filter(function(d) {return d === undefined;})
      .remove();


  }

  _slider.max = function(_) {
    if(!arguments.length) return max;
    max = _;
    return _slider;
  }

  _slider.min = function(_) {
    if(!arguments.length) return min;
    min = _;
    return _slider;
  }

  _slider.value = function(_) {
    if(!arguments.length) return value;
    value = _;
    return _slider;
  }

  _slider.label = function(_) {
    if(!arguments.length) return label;
    label = _;
    return _slider;
  }

  _slider.valueFormatter = function(_) {
    if(!arguments.length) return valueFormatter;
    valueFormatter = _;
    return _slider;
  }

  return d3.rebind(_slider, dispatch, 'on');
}