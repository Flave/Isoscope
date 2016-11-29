import * as d3 from 'd3';
import _ from 'lodash';
import L from 'leaflet';

export default function Overlay() {
  var map,
      data,
      container,
      svg,
      root,
      cluster,
      clusterEnter,
      isoline,
      isolineEnter,
      center,
      centerEnter,
      highlight,
      transform = d3.geoTransform({point: streamProjectPoint}),
      path = d3.geoPath().projection(transform), // only used for bounds calculation
      line = d3.line()
        .x(function(d){ return d[0]})
        .y(function(d){return d[1]})
        .curve(d3.curveCatmullRom.alpha(0.3));

  function _overlay() {
    container = d3.select(map.getPanes().overlayPane)
    svg = container
      .selectAll('svg.m-overlay')
      .data([1]);

    var filteredData = _.filter(data, function(d) {return !d.loading; });

    svg
      .enter()
      .append('svg:svg')
      .attr('class', 'm-overlay')
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .style('position', 'relative');

    root = svg.selectAll('g.m-overlay__root')
      .data([filteredData]);

    root
      .enter()
      .append('g')
      .classed('m-overlay__root', true)
      .classed('leaflet-zoom-hide', true);

    drawIsolines();
    drawCenter();
    resetContainers();
  }

  function drawIsolines() {
    cluster = root
      .selectAll('g.m-cluster')
      .data(function(clusters) {  return clusters; });

    cluster.exit().remove();

    clusterEnter = cluster
      .enter()
      .append('g')
      .attr('class', 'm-cluster');

    isoline = clusterEnter
      .merge(cluster)
      .selectAll('path.m-isoline')
      .data(function(cluster) {
        return cluster.features;
      });

    isolineEnter = isoline
      .enter()
      .append('path')
      .attr('class', 'm-isoline');

    isoline
      .merge(isolineEnter)
      .attr('d', function(feature) { 
        return createDAttribute(projectIsoline(feature));
      })
      .classed('is-highlighted', false)
      .filter(function(d, i) {
        return i === highlight;
      })
      .classed('is-highlighted', true)
      .raise();
  }


  function drawCenter() {
    center = cluster.merge(clusterEnter)
      .selectAll('text.m-isoline__center')
      .data(function(d, i) {return [d];});

    centerEnter = center
      .enter()
      .append('text')
      .classed('m-isoline__center', true)
      .text('↓');

    center.merge(centerEnter)
      .attr('transform', function(cluster, i) {
        var location = cluster.properties.clusterLocation,
            projectedPoint = projectPoint(location.lat, location.lng);
        return `translate(${projectedPoint[0] - 5}, ${projectedPoint[1] - 5})`;
      })
      .raise();
  }

  function projectPoint(x, y)  {
    var point = map.latLngToLayerPoint(new L.LatLng(x, y))
    return [point.x, point.y];
  }

  function streamProjectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }

  function createDAttribute(projectedIsoline) {
    var dAttribute = _(projectedIsoline)
      .reduce(function(dAttribute, polygon) {
        return dAttribute + line(polygon);
      }, '');
      return dAttribute;
  }

  function projectIsoline(feature) {
    return _(feature.geometry.coordinates)
      .map(function(polygon) {
        return _.map(polygon, function(latLng) {
          var point = map.latLngToLayerPoint(new L.LatLng(latLng[1], latLng[0]))
          return [point.x, point.y];
        });
      })
      .value();
  }

  function getBounds(features) {
    var top = Infinity,
        left = Infinity,
        bottom = -Infinity,
        right = -Infinity;

    data.forEach(function(geoData) {
      var bounds = path.bounds(geoData);
      left = bounds[0][0] < left ? bounds[0][0] : left;
      top = bounds[0][1] < top ? bounds[0][1] : top;
      right = bounds[1][0] > right ? bounds[1][0] : right;
      bottom = bounds[1][1] > bottom ? bounds[1][1] : bottom;
    });

    return [[left, top], [right, bottom]];
  }

  function resetContainers() {
    // only render stuff if there is actually some geometry
    if(data[0] && !data[0].loading) {
      var bounds = getBounds(data),
          topLeft = bounds[0],
          bottomRight = bounds [1];

      svg
        .attr('width', bottomRight[0] - topLeft[0] + 8)
        .attr('height', bottomRight[1] - topLeft[1] + 8)
        .style('left', `${topLeft[0] - 4}px`)
        .style('top', `${topLeft[1] - 4}px`);

      root
        .attr("transform", `translate(${-topLeft[0] + 4},${-topLeft[1] + 4})`);
    }    
  }

  _overlay.map = function(_) {
    if(!arguments.length) return map;
    map = _;
    map.on('zoomend', function() {
      _overlay();
    });
    return _overlay;
  }

  _overlay.data = function(_) {
    if(!arguments.length) return data;
    data = _;
    return _overlay;
  }

  _overlay.highlight = function(_) {
    if(!arguments.length) return highlight;
    highlight = _;
    return _overlay;
  }

  return _overlay;
}