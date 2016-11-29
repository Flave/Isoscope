import * as d3 from 'd3';
import _ from 'lodash';

export default function HelpOverlay() {
  var parent,
      visibility = true,
      root,
      mapHelp, mapHelpEnter,
      uiHelp, uiHelpEnter,
      rootEnter;

  function _helpOverlay(_parent) {
    parent = _parent;

    root = parent
      .selectAll('div.m-help')
      .data(visibility ? [1] : []);

    rootEnter = root
      .enter()
      .append('div')
      .classed('m-help', true);

    root
      .exit()
      .remove();

    uiHelp = rootEnter
      .append('div')
      .style('opacity', 0)
      .classed('m-help__ui-help', true)
      .transition(250)
      .delay(400)
      .style('opacity', 1)
      .text('Search for a place, adjust the day of the week and travel duration and brush through the hours of a day');

    mapHelp = rootEnter
      .append('div')
      .style('opacity', 0)
      .classed('m-help__map-help', true)
      .transition(250)
      .delay(550)
      .style('opacity', 1)
      .text('Click anywhere on the map to see the action scope of your car...');

    return _helpOverlay;
  }

  _helpOverlay.visibility = function(_) {
    if(!arguments.length) return visibility;
    visibility = _;
    return _helpOverlay;
  }

  return _helpOverlay;
}