// Import stylesheets
import './style.css';
import {
  Map,
  TileLayer,
  LayerGroup,
  Control,
  Marker,
  Icon,
  GeoJSON,
} from 'leaflet';
import * as d3 from 'd3';

import config from './data/config.json';
import polygon from './data/polygon.json'
import green from './data/green.json'
import roadls from './data/road.json'
import road1 from './data/road1.json'

// Write Javascript code!
const map = new Map('map');
const gdlayer = new TileLayer(
  'http://wprd0{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7',
  {
    subdomains: '1234',
  }
);

//天地图加载
const tdtVectorLayer = new TileLayer(config.default.layer.tdtlayer, {});
//天地图加载
const tdtLabelLayer = new TileLayer(config.default.layer.tdtlabel, {});

gdlayer.addTo(map);
map.setView([23.036984, 114.418868], 15);
//map.setView([39.909186, 116.397411], 10);

const tdtLayer = new LayerGroup([tdtVectorLayer, tdtLabelLayer]);

const layerControl = new Control.Layers(
  {
    高德: gdlayer,
    天地图: tdtLayer,
  },
  {},
  { collapsed: false }
);
layerControl.addTo(map);

//加载marker

const marker = new Marker([23.036984, 114.418868], {
  icon: new Icon({
    iconUrl:
      'data:image/svg+xml,' + encodeURIComponent(config.default.svg.svg2), //Url后也可以直接给网址‘.....png’
    iconSize: [32, 32], //icon是以左上角为原点
    iconAnchor: [16, 32], //icon的锚点
  }),
});

marker.addTo(map);

const markerdata = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        NAME: '华康医院',
        TYPE: '医院',
      },
      geometry: {
        coordinates: [114.41792483933148, 23.042443899549625],
        type: 'Point',
      },
    },
    {
      type: 'Feature',
      properties: {
        NAME: '第一妇幼保健院',
        TYPE: '医院',
      },
      geometry: {
        coordinates: [114.4164680797129, 23.05202171818607],
        type: 'Point',
      },
    },
    {
      type: 'Feature',
      properties: {
        NAME: '惠州奥林匹克体育场',
        TYPE: '体育场',
      },
      geometry: {
        coordinates: [114.44142314298159, 23.03567291124908],
        type: 'Point',
      },
    },
  ],
};

const markerlayer = new GeoJSON(markerdata, {
  pointToLayer: (geoJsonPoint, latlng) => {
    switch (geoJsonPoint.properties['TYPE']) {
      case '医院':
        return new Marker(latlng, {
          icon: new Icon({
            iconUrl:
              'data:image/svg+xml,' +
              encodeURIComponent(config.default.svg.svg1),
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        }).bindTooltip(geoJsonPoint.properties['NAME'], { permanent: true });
      case '体育场':
        return new Marker(latlng, {
          icon: new Icon({
            iconUrl:
              'data:image/svg+xml,' +
              encodeURIComponent(config.default.svg.svg3),
            iconSize: [32, 32],
            iconAnchor: [16, 15],
          }),
        }).bindTooltip(geoJsonPoint.properties['NAME'], { permanent: false });
    }
  },
});

markerlayer.addTo(map);


// 道路线图层
const roadlLayer1 = new GeoJSON(road1, {
  style: function (geoJsonFeature) {
    return {
      color: 'gray',
      weight: 3,     
    };
  },
});
roadlLayer1.addTo(map);

const roadlLayer = new GeoJSON(roadls, {
  style: function (geoJsonFeature) {
    return {
      color: 'red',
      weight: 3,
      className: 'road',
    };
  },
});
roadlLayer.addTo(map);



// d3 magic
//https://d3-wiki.readthedocs.io/zh_CN/latest/过渡/
//https://leafletjs.com/reference.html#path
//https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/stroke-dasharray
const svg5 = d3.select('svg');//找到svg
const road = svg5.select('path.road');//标签类型，ID#
const length = road.node().getTotalLength();
const animate = () => {
  road
    .interrupt()//
    .attr('stroke-dasharray', `0,${length}`)
    .transition()
    .duration(5000)
    .ease(d3.easeLinear)
    .attr('stroke-dasharray', `${length},${length}`)
    .on('end', animate);
};
animate();