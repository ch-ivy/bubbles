import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
} from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import * as olProj from 'ol/proj';
import XYZ from 'ol/source/XYZ';
import { defaults as defaultControls, Rotate } from 'ol/control';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { ImageCanvas, OSM, Vector as VectorSource } from 'ol/source';
import Draw from 'ol/interaction/Draw';
import Geocoder from 'ol-geocoder';
import GeometryType from 'ol/geom/GeometryType';
import { toContext } from 'ol/render';
import Polygon from 'ol/geom/Polygon';
import Fill from 'ol/style/Fill';
import ImageLayer from 'ol/layer/Image';
import { ConversionService } from '../conversion.service';

@Component({
  selector: 'app-map2',
  templateUrl: './map2.component.html',
  styleUrls: ['./map2.component.scss'],
})
export class Map2Component implements OnInit {
  map: Map;
  control: 'move' | 'build' | 'delete' = 'move';
  draw: Draw;
  source = new VectorSource();
  vectorLayer = new VectorLayer({
    source: this.source,
  });
  geocoder: Geocoder;
  image = {
    portrait: 'https://www.solarquotes.com.au/img/estimator/panel-image.png',
    landscape:
      'https://www.solarquotes.com.au/img/estimator/panel-image-land.png',
  };
  panelMatrix = {};

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private convert: ConversionService
  ) {
    // Initializes map
    this.map = new Map({
      controls: defaultControls(),
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}',
          }),
        }),
        this.vectorLayer,
      ],
      view: new View({
        center: olProj.fromLonLat([145.2273674, -37.8133078]),
        zoom: 20,
      }),
    });

    //Instantiate with some options and add the Search Input Control
    this.geocoder = new Geocoder('nominatim', {
      provider: 'osm',
      lang: 'en',
      placeholder: 'Enter Your address',
      limit: 5,
      debug: false,
      autoComplete: true,
      keepOpen: true,
      targetType: 'text-input',
      preventDefault: true,
    });
    this.map.addControl(this.geocoder);

    //Listen when an address is chosen and changes view
    this.geocoder.on('addresschosen', (evt) => {
      const pos = evt.place;
      console.log(pos);
      const newPos = new View({
        center: olProj.fromLonLat([pos.lon, pos.lat]),
        zoom: 20,
      });
      this.map.setView(newPos);
    });
  }

  ngOnInit() {}

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    this.map.setTarget('map');
  }

  toggleControls(type: 'move' | 'build' | 'delete') {
    this.control = type;
    // this.map.removeInteraction(this.draw);
    this.addInteraction();
  }

  addInteraction() {
    switch (this.control) {
      case 'build':
        {
          this.draw = new Draw({
            source: this.source,
            type: GeometryType.POLYGON,
            geometryName: 'Rectangle',
          });
          // this.map.addInteraction(this.draw);
          this.drawPanel();
        }
        break;
      case 'move':
        {
          // document.body.style.cursor = 'pointer';
        }
        break;
    }
  }

  changeCursor() {
    switch (this.control) {
    }
  }

  drawPanel() {
    this.map.on('click', (evt) => {
      // console.log(evt);
      /* const target: HTMLCanvasElement =
        this.el.nativeElement.querySelector('.ol-layer canvas');
      var img = this.renderer.createElement('img');
      const cx = target.getContext('2d');
      console.log(evt.pixel);
      console.log(evt.coordinate);

      cx.strokeStyle = 'red';
      cx.lineWidth = 10;
      cx.strokeRect(evt.pixel[0], evt.pixel[1], 50, 50); */

      var numPieCharts = 750,
        coordinates = [],
        data = [],
        colors = [];
      var i, p;
      for (i = 0; i < numPieCharts; i++) {
        coordinates.push([
          -180 + 360 * Math.random(),
          -90 + 180 * Math.random(),
        ]);
        p = 100 * Math.random();
        data.push([p, 100 - p]);
        colors.push([
          '#' +
            (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6),
          '#' +
            (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6),
        ]);
      }

      var layer = new ImageLayer({
        source: new ImageCanvas({
          canvasFunction: (
            extent,
            resolution,
            pixelRatio,
            size,
            projection
          ) => {
            var canvas = document.createElement('canvas');
            canvas.width = size[0];
            canvas.height = size[1];

            var cx = canvas.getContext('2d');
            var mapExtent = this.map
              .getView()
              .calculateExtent(this.map.getSize());
            var canvasOrigin = this.map.getPixelFromCoordinate([
              extent[0],
              extent[3],
            ]);
            var mapOrigin = this.map.getPixelFromCoordinate([
              mapExtent[0],
              mapExtent[3],
            ]);
            var delta = [
              mapOrigin[0] - canvasOrigin[0],
              mapOrigin[1] - canvasOrigin[1],
            ];

            console.log({ canvasOrigin, mapExtent, delta });

            var radius = 15;

            // Track the accumulated arcs drawn
            var totalArc = (-90 * Math.PI) / 180;
            var percentToRadians = ((1 / 100) * 360 * Math.PI) / 180;
            var wedgeRadians;

            let drawWedge = (coordinate, percent, color) => {
              var point = olProj.transform(
                coordinate,
                'EPSG:4326',
                'EPSG:3857'
              );
              var pixel = this.map.getPixelFromCoordinate(point);
              var cX = pixel[0] + delta[0],
                cY = pixel[1] + delta[1];

              // Compute size of the wedge in radians
              wedgeRadians = percent * percentToRadians;

              // Draw
              var img = this.renderer.createElement('img');
              img.src = this.image.landscape;
              cx.drawImage(img, cX, cY);

              // Accumulate the size of wedges
              totalArc += wedgeRadians;
            };

            var drawPie = function (coordinate, data, colors) {
              for (var i = 0; i < data.length; i++) {
                drawWedge(coordinate, data[i], colors[i]);
              }
            };

            for (var i = 0; i < coordinates.length; i++) {
              drawPie(coordinates[i], data[i], colors[i]);
            }

            return canvas;
          },

          projection: 'EPSG:3857',
        }),
      });

      this.map.addLayer(layer);
    });
  }
}
