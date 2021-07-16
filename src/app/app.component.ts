import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import * as olProj from 'ol/proj';
import XYZ from 'ol/source/XYZ';
import { FullScreen, defaults as defaultControls } from 'ol/control';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import Draw from 'ol/interaction/Draw';
import { Icon, Style } from 'ol/style';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import { Modify } from 'ol/interaction';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  map: Map;
  control: 'move' | 'build' | 'delete' = 'move';
  draw: Draw;
  source = new VectorSource({ wrapX: false });
  features = [];
  vectorLayer = new VectorLayer({
    source: this.source,
    style: new Style({
      image: new Icon({
        src: '../assets/panel.svg',
        scale: 1.5,
      }),
    }),
  });

  constructor() {}

  ngOnInit() {
    this.map = new Map({
      controls: defaultControls().extend([new FullScreen()]),

      target: 'hotel_map',
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}',
          }),
        }),
        this.vectorLayer,
      ],
      view: new View({
        center: olProj.fromLonLat([7.0785, 51.4614]),
        zoom: 20,
        rotation: 8,
      }),
    });
  }

  toggleControls(type: 'move' | 'build' | 'delete') {
    this.control = type;
    this.map.removeInteraction(this.draw);

    this.addInteraction();
  }

  addInteraction() {
    if (this.control === 'build') {
      this.draw = new Draw({
        source: this.source,
        type: 'Point',
        style: new Style({
          image: new Icon({
            src: '../assets/panel.svg',
          }),
        }),
      });
      this.map.addInteraction(this.draw);
    }
  }
}
