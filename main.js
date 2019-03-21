import 'ol/ol.css';
import GeoJSON from 'ol/format/GeoJSON';
import Map from 'ol/Map';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import View from 'ol/View';
import XYZSource from 'ol/source/XYZ';
import {fromLonLat} from 'ol/proj';
import {defaults as defaultInteractions, Modify, Select} from 'ol/interaction.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import Collection from 'ol/Collection';
import union from '@turf/union';
import intersect from '@turf/intersect';
import Feature from 'ol/Feature.js';

const format = new GeoJSON({featureProjection: 'EPSG:3857'});
const inputFile = './data/data.json'
var GJV = require("geojson-validation");

var source = new VectorSource({
        format: new GeoJSON(),
        url: inputFile
      });

var select = new Select({
        wrapX: false
    });

var modify = new Modify({
        features: select.getFeatures()
      });

var layer = new TileLayer({
      source: new XYZSource({
        url: 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg'
      })
    });

var layer2 = new VectorLayer({
	source: source
	})

function isValid(){
  var features = source.getFeatures()
  var allValid = true;
  for(var i=0; i < features.length; i++){
      if(!format.isValidType(features.item(i), GeoJSON.Polygon)){
        allValid = false;
      }
  }
  if(allValid){
    alert("Input is valid! Press ok to continue.")
  }else {
    alert("Input is not valid. Please enter valid input.")
  }
};

function intersection(selectedFeatures) {
	var intersectedPoly = intersect(format.writeFeatureObject(selectedFeatures.item(0)), format.writeFeatureObject(selectedFeatures.item(1)));
	if(intersectedPoly != null && intersectedPoly != undefined){
    var newPoly = format.readFeature(intersectedPoly)
    source.addFeature(newPoly)
    source.removeFeature(selectedFeatures.item(0))
    source.removeFeature(selectedFeatures.item(1))
    select.getFeatures().clear();
    alert("Success")
  }else{
    console.log("Intersection is null")
  }
};

function unionFunc(selectedFeatures){
	var unionPoly = union(format.writeFeatureObject(selectedFeatures.item(0)), format.writeFeatureObject(selectedFeatures.item(1)));
	var newPoly = format.readFeature(unionPoly)
  source.addFeature(newPoly)
	source.removeFeature(selectedFeatures.item(0))
	source.removeFeature(selectedFeatures.item(1))
  select.getFeatures().clear();
	alert("Success")
}

const map = new Map({
  target: 'map-container',
  interactions: defaultInteractions().extend([select, modify]),
  layers: [layer, layer2],
  view: new View({
    center: fromLonLat([0.1278, 51.5074]),
    zoom: 11
  })
});

var selectElement = document.getElementById('type');

function fn() {
  if((select.getFeatures().getLength() < 2) || (select.getFeatures().getLength() > 2)){
    alert("Please select 2 features")
  }else{
    if (selectElement.value == "intersect"){
      intersection(select.getFeatures())
    }
    if (selectElement.value == "union"){
      unionFunc(select.getFeatures())
    }
  } 
}

if (select != null) {
	select.on('select', function(e) {
		document.getElementById('status').innerHTML = '&nbsp;' + e.target.getFeatures().getLength() +
            ' selected features (Please press shift + click on the feature if you would like to select two features together)';
    	});
}

let v = document.getElementById("execute");
v.addEventListener("click", fn);

document.addEventListener("DOMContentLoaded", function() {
  isValid();
});


const download = document.getElementById('download');
source.on('change', function() {
  const features = source.getFeatures();
  const json = format.writeFeatures(features);
  download.href = 'data:text/json;charset=utf-8,' + json;
});

/**
var writer = new ol.format.GeoJSON();
var geojsonStr = writer.writeFeatures(yourVectorSource.getFeatures());
**/



