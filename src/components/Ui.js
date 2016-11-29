import * as d3 from 'd3';
import _ from 'lodash';

import stateStore from 'app/components/StateStore';
import SegmentedControl from 'app/components/SegmentedControl';
import Slider from 'app/components/Slider';

var weekdays = [{"label":"MO","value":1},{"label":"TU","value":2},{"label":"WE","value":3},{"label":"TH","value":4},{"label":"FR","value":5},{"label":"SA","value":6},{"label":"SO","value":0}];

export default function Ui() {
  var parent,
      state,
      segmentedControl = SegmentedControl().options(weekdays).label('Day of the week'),
      durationSlider = Slider().min(1).max(30).label('Travel Duration').valueFormatter(function(value) {return (value + " min")}),
      hourSlider = Slider().min(0).max(23).label('Hour of the Day').valueFormatter(hourValueFormatter),
      dayElement, dayElementEnter,
      durationElement, durationElementEnter,
      hourElement, hourElementEnter,
      searchElement, searchElementEnter,
      clearElement, clearElementEnter;
      
  function _ui(_parent) {
    parent = _parent;
    state = stateStore.get();
    createSearchControl(state);
    createDayControl(state);
    createDurationControl(state);
    createHourControl(state);
    createClearControl();
    createHelpControl(state);
    createInfo();
    return _ui;
  }

  function hourValueFormatter(value) {
    var hour = (value % 12) === 0 ? 12 : (value % 12);
    var suffix = value < 12 ? "am" : "pm"
    return d3.format("02")(hour) + ":00 " + suffix
  }

  function createSearchControl() {
    searchElement = parent
      .selectAll('div.m-search-control')
      .data([1]);

    searchElementEnter = searchElement
      .enter()
      .append('div')
      .attr('class', 'm-search-control')
      .classed('m-ui__control', true);

    searchElement.merge(searchElementEnter)
      .selectAll('input.m-search-control__input')
      .data([1])
      .enter()
      .append('input')
      .attr('class', 'm-search-control__input')
      .attr('placeholder', 'Search for a city...')
      .attr('type', 'text')
      .on('change', function() {
        stateStore.set('locationQuery', d3.event.target.value);
      });
  }

  function createDayControl(state) {
    dayElement = parent
      .selectAll('div.m-day-control')
      .data([1]);

    dayElementEnter = dayElement
      .enter()
      .append('div')
      .attr('class', 'm-day-control')
      .classed('m-ui__control', true);

    segmentedControl
      .selected(state.day)
      .on('change', function(day) {
        stateStore.set('day', day);
      })(dayElement.merge(dayElementEnter));
  }

  function createDurationControl(state) {
    durationElement = parent
      .selectAll('div.m-duration-control')
      .data([1]);

    durationElementEnter = durationElement
      .enter()
      .append('div')
      .attr('class', 'm-duration-control')
      .classed('m-ui__control', true);

    durationSlider
      .value(state.durationInput)(durationElement.merge(durationElementEnter))
      .on('change', function(duration) {
        stateStore.set('duration', duration);
      })
      .on('input', function(duration) {
        stateStore.set('durationInput', duration);
      });
  }

  function createHourControl(state) {
    hourElement = parent
      .selectAll('div.m-hour-control')
      .data([1]);

    hourElementEnter = hourElement
      .enter()
      .append('div')
      .attr('class', 'm-hour-control')
      .classed('m-ui__control', true);

    hourSlider
      .value(state.hour)(hourElement.merge(hourElementEnter))
      .on('input', function(hour) {
        stateStore.set('hour', hour);
      });
  }

  function createClearControl() {
    clearElement = parent
      .selectAll('span.m-clear-control')
      .data([1]);

    clearElementEnter = clearElement
      .enter()
      .append('span')
      .attr('class', 'm-clear-control')
      .classed('m-ui__control', true);


    clearElementEnter
      .append('span')
      .text('Clear Map')
      .classed('m-clear-control__button', true)
      .on('click', function() {
        stateStore.set('clusterLocations', []);
      });
  }

  function createHelpControl(state) {
    var helpElement = parent
      .selectAll('span.m-help-control')
      .data([1]);

    var helpElementEnter = helpElement
      .enter()
      .append('span')
      .attr('class', 'm-help-control')
      .classed('m-ui__control', true)

    helpElementEnter
      .merge(helpElement)
      .classed('is-active', state.showHelp);

    helpElementEnter
      .append('span')
      .text('Help')
      .classed('m-help-control__button', true)
      .on('click', function() {
        stateStore.set('showHelp', !state.showHelp);
      });
  }

  function createInfo(state) {
    var infoElement = parent
      .selectAll('div.m-ui__info')
      .data([1]);

    var infoElementEnter = infoElement
      .enter()
      .append('div')
      .attr('class', 'm-ui__info')
      .classed('m-ui__control', true);


    infoElementEnter
      .append('div')
      .html('<p>➞ More info <a href="http://isoscope.martinvonlupin.de/" target="_blank">here</a></p>')
      .classed('m-ui__info-text', true);
  }

  return _ui;
}