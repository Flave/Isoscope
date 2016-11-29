import 'app/components/leaflet-providers';
import * as d3 from 'd3';

import Map from 'app/components/Map';
import IsolineApi from 'app/components/IsolineApi';
import LocationApi from 'app/components/LocationApi';
import Overlay from 'app/components/Overlay';
import HelpOverlay from 'app/components/HelpOverlay';
import Ui from 'app/components/Ui';
import stateStore from 'app/components/StateStore';

// Copies a variable number of methods from source to target.
d3.rebind = function(target, source) {
  var i = 1, n = arguments.length, method;
  while (++i < n) target[method = arguments[i]] = d3_rebind(target, source, source[method]);
  return target;
};

function d3_rebind(target, source, method) {
  return function() {
    var value = method.apply(source, arguments);
    return value === source ? target : value;
  };
}

var app = function() {
  var state = stateStore.get(),
      map = Map().location(state.location)(document.getElementById('map-container')),
      isolineApi = IsolineApi(),
      locationApi = LocationApi(),
      clusterLocations = [],
      nextClusters = [],
      clusters = [],
      overlay = Overlay().map(map.getMap()),
      ui = Ui(),
      uiContainer = d3.select('#ui-container'),
      helpOverlay = HelpOverlay(),
      helpContainer = d3.select('#help-container');

  function registerEventHandlers() {
    stateStore
      .on('change', function() {
        update();
      });

    map
      .on('click', function(event) {
        var clusterLocations = _.clone(stateStore.get().clusterLocations);
        clusterLocations.push({lat: event.latlng.lat, lng: event.latlng.lng})
        stateStore.set('clusterLocations', clusterLocations);
        stateStore.set('showHelp', false);
        // this should be done inside isolineAPI
        clusters = isolineApi.get(stateStore.get());
        update();
      });

    isolineApi
      .on('received', function() {
        update();
      });
  }

  function update() {
    var state = stateStore.get();
    map.location(state.location)();

    clusters = isolineApi.get(stateStore.get());
    overlay
      .data(clusters)
      .highlight(state.hour)();

    ui(uiContainer);

    helpOverlay.visibility(state.showHelp)(helpContainer);
  }

  window.setTimeout(function() {
    d3.select('body').classed('is-loading', false);
  }, 300);

  registerEventHandlers();
  update();
}

export default app;