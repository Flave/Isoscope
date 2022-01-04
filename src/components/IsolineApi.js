import Q from 'q';
import _ from 'lodash';
import * as d3 from 'd3';
import jsonp from 'jsonp';
import md5 from 'md5';
import EventEmitter from 'events';


export default function api(){
  var dateFormatter = d3.timeFormat('%Y-%m-%dT%H:%M:%S'),
      api = _.assign({}, EventEmitter.prototype),
      url = "",
      base = "https://isoline.route.cit.api.here.com/routing/7.2/calculateisoline.json",
      params = {
        app_id: "rqXJVkByzWlBoNVOJhRV",
        app_code: "sThl40ccY2bSg4X1yoSWPg",
        departure: "2014-01-20T00:00:00",
        mode: "fastest;car;traffic:enabled",
        rangetype: "time",
        start: "geo!52.51578,13.37749",
        range: 300,
        singlecomponent: true,
        resolution: 10,
        quality: 3,
        requestId: "",
        jsonCallback: ""
      },
      defaultConfig = {
        day: 0,
        mode: "car",
        clusterLocation: {lat: 51.50, lng: -0.083},
        duration: 5
      },
      data = {};

  /*
    config.day = number between 0 and 6
    config.mode = ["car"|"pedestrian"|"bike"]
    config.location = [lat|lng]
    config.duration = nuber representing minutes
  */
  api.get = function(_config) {
    return _.map(_config.clusterLocations, function(location) {
      var config = _.merge({}, defaultConfig, _config, {clusterLocation: location});
      var clusterFromCache = data[createClusterHash(config)];
      return clusterFromCache ? clusterFromCache : fetchCluster(config);
    });
  }

  function fetchCluster(config) {
    var isolinePromises = _.map(_.range(24), function(hour) {
      return fetchIsoline(config, hour);
    });

    Q.all(isolinePromises)
      .then(function(isolines) {
        var clusterHash = createClusterHash(config);
        data[clusterHash] = processCluster(isolines, config);
        api.emit('received');
      });
    return {loading: true};
  }

  function processCluster(isolines, config) {
    return {
      type: "FeatureCollection",
      features: isolines,
      properties: config
    }
  }

  function processIsoline(isoline) {
    return {
      type: "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [_.map(isoline[0].component[0].shape, function(coordinate) {
                  return _.chain(coordinate.split(',')).map(_.toNumber).reverse().value();
                })]
      }
    }
  }

  function createClusterHash(config) {
    return `${config.mode}/${config.clusterLocation.lat}/${config.clusterLocation.lng}/${config.duration}/${config.day}`;
  }

  function fetchIsoline(config, hour) {
    var deferred = Q.defer(),
        params = buildIsolineParams(config, hour);

    window[params.jsonCallback] = function(data) {
      deferred.resolve(processIsoline(data.response.isoline));
    }

    jsonp(base + buildQuery(params));
    return deferred.promise;
  }

  function buildIsolineParams(config, hour) {
    var isolineParams = _.clone(params),
        lastSunday = d3.timeWeek(new Date()),
        departureDate = d3.timeDay(lastSunday);

    departureDate = new Date(departureDate.getTime() + 24 * 60 * 60 * 1000 * config.day);
    departureDate.setHours(hour);
    isolineParams.departure = dateFormatter(departureDate);
    isolineParams.start = `geo!${config.clusterLocation.lat},${config.clusterLocation.lng}`;
    isolineParams.range = config.duration * 60;

    isolineParams.requestId = createIsolineHash(isolineParams);
    isolineParams.jsonCallback = "callback_" + isolineParams.requestId;
    return isolineParams;
  }

  function createIsolineHash(p) {
    return md5(`${p.departure}/${p.start.lat}/${p.start.lng}/${p.departure}/${p.duration}`);
  }

  function buildQuery(params) {
    var queryString = _.reduce(params, function(query, param, key) {
      return `${query}${key}=${param}&`;
    }, "?");
    return queryString.slice(0, queryString.length - 1);
  }

  return api;
}