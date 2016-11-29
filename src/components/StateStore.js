import EventEmitter from 'events';
import _ from 'lodash';

var state = {
  clusters: [],
  duration: 5,
  durationInput: 5,
  locationQuery: "",
  location: [51.505, -0.09],
  clusterLocations: [],
  showHelp: true,
  day: 1,
  hour: 0
};

var stateStore = _.assign({}, EventEmitter.prototype, {
  set: function(name, value) {
    state[name] = value;
    stateStore.emit('change');
  },

  get: function(name) {
    if(name === undefined)
      return state;
    return state[name];
  }
});

export {stateStore as default};