import Q from 'q';
import _ from 'lodash';
import * as d3 from 'd3';
import jsonp from 'jsonp';
import md5 from 'md5';
import EventEmitter from 'events';

import stateStore from 'app/components/StateStore';


export default function api(){
  var api = _.assign({}, EventEmitter.prototype),
      currentQuery,
      url = "",
      base = "https://geocoder.api.here.com/6.2/geocode.json",
      params = {
        app_id: "bVQHRXUn6uNHP3B24bdt",
        app_code: "mwkokcyyoCIfExsmQq0qIg",
        searchtext: "",
        gen: 9,
        requestId: "",
        jsonCallback: ""
      },
      data = {};

    function init() {
      stateStore.on('change', function() {
        var locationQuery = stateStore.get('locationQuery');
        if(locationQuery.length)
          api.get(locationQuery);
      });
    }

  /*
    config.day = number between 0 and 6
    config.mode = ["car"|"pedestrian"|"bike"]
    config.location = [lat|lng]
    config.duration = nuber representing minutes
  */
  api.get = function(locationQuery) {
    var deferred = Q.defer();
    params.searchtext = locationQuery;
    params.jsonCallback = "callback_" + md5(locationQuery);
    
    window[params.jsonCallback] = function(data, err) {
      var location;
      if(err) console.log(err);
      if(!data.Response.View.length) {
        alert("Where's that supposed to be? Try something else...");
        /*stateStore.set('location')*/
      }
      else {
        location = data.Response.View[0].Result[0].Location.DisplayPosition;
        stateStore.set('location', [location.Latitude, location.Longitude]);
      }
    }

    if(currentQuery !== locationQuery) {
      jsonp(base + buildQuery(params));
      currentQuery = locationQuery;
    }
  }

  function createClusterHash(config) {
    return `${config.mode}/${config.location.lat}/${config.location.lng}/${config.duration}/${config.day}`;
  }

  function createLocationHash(p) {
    return md5(`${p.searchtext}`);
  }

  function buildQuery(params) {
    var queryString = _.reduce(params, function(query, param, key) {
      return `${query}${key}=${param}&`;
    }, "?");
    return queryString.slice(0, queryString.length - 1);
  }

  init();
  return api;
}