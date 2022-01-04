import L from 'leaflet';
import * as d3 from 'd3';
import stateStore from 'app/components/StateStore';

export default function() {
  var mapId = "map-container",
      mapComponent,
      container,
      previousLocation,
      location,
      dispatch = d3.dispatch('click', 'reset');

  function _map(_container) {
    if(!mapComponent) {
      container = _container;
      initialize();
    } else {
      if(location !== previousLocation) {
        mapComponent.setView(location);
        previousLocation = location;
      }
    }

    return _map;
  }

  function initialize() {
    d3.select(container).append('div').attr('id', mapId);
    mapComponent = L
      .map( document.getElementById(mapId), {zoomControl: false})
      .setView(location, 13);

    L.control.zoom({position: 'topright'}).addTo(mapComponent);

    L.tileLayer.provider('HERE.terrainDay', {
        app_id: 'rqXJVkByzWlBoNVOJhRV',
        app_code: 'sThl40ccY2bSg4X1yoSWPg'
    }).addTo(mapComponent);

    mapComponent
      .on('click', function(event) {
        dispatch.call('click', _map, event);
      });
  }

  _map.config = function(config) {

  }

  _map.getMap = function() {
    return mapComponent;
  }

  _map.location = function(_) {
    if(!arguments.length) return location;
    location = _;
    return _map;
  }

  return d3.rebind(_map, dispatch, 'on');
}