import { AfterViewInit, Component, NgZone } from '@angular/core';

import { Draw, Modify, Snap } from 'ol/interaction';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import Polygon from 'ol/geom/Polygon';
import VectorSource from 'ol/source/Vector';
import SimpleGeometry from 'ol/geom/SimpleGeometry';
import VectorLayer from 'ol/layer/Vector';
import { platformModifierKeyOnly, primaryAction } from 'ol/events/condition';

import Style from 'ol/style/Style';
import MultiPoint from 'ol/geom/MultiPoint';
import { Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import { DrawEvent } from 'ol/interaction/Draw';
import { Image } from 'ol/layer';

// import ol_layer_GeoImage from 'ol-ext/layer/GeoImage'
import GeoImageSource from 'ol-ext/source/GeoImage';
import * as olProj from 'ol/proj';
import GeometryType from 'ol/geom/GeometryType';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit {
  map!: Map;

  panelWidth = 1000;
  panelHeight = 1960;

  panelCenter = [this.panelWidth / 2000, this.panelHeight / 2000];

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    if (!this.map) {
      this.zone.runOutsideAngular(() => this.initMap());
    }
  }

  private initMap(): void {
    const style = new Style({
      geometry: function (feature) {
        const modifyGeometry = feature.get('modifyGeometry');
        return modifyGeometry ? modifyGeometry.geometry : feature.getGeometry();
      },
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
      stroke: new Stroke({
        color: '#ffcc33',
        width: 2,
      }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({
          color: '#ffcc33',
        }),
      }),
    });

    const source = new VectorSource({ wrapX: false });

    const vector = new VectorLayer({
      source: source,
      style: (feature) => {
        const styles = [style];
        const modifyGeometry = feature.get('modifyGeometry');
        const geometry = modifyGeometry
          ? modifyGeometry.geometry
          : feature.getGeometry();

        if (geometry instanceof Polygon) {
          styles.push(
            new Style({
              geometry: new MultiPoint(geometry.getCoordinates()[0].slice(1)),
              image: new CircleStyle({
                radius: 4,
                fill: new Fill({
                  color: '#33cc33',
                }),
              }),
            })
          );
        }

        return styles;
      },
    });

    this.map = new Map({
      target: 'site',
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'http://mt{0-3}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
          }),
        }),
        vector,
      ],
      view: new View({
        center: olProj.transform(
          olProj.toLonLat([145.041347, -37.611294], 'EPSG:4326'),
          'EPSG:4326',
          'EPSG:3857'
        ),
        zoom: 21,
        // minZoom: 15,
        maxZoom: 22,
      }),
    });

    const drawPoly = new Draw({
      source: source,
      type: GeometryType.LINE_STRING,
      maxPoints: 3,
      geometryFunction: (coordinates: any, geometry: SimpleGeometry) => {
        const first = coordinates[0];
        const newCoordinates = [first];

        if (coordinates.length >= 3) {
          const last = coordinates[coordinates.length - 1];

          const v1x = coordinates[1][0] - first[0];
          const v1y = coordinates[1][1] - first[1];
          const v2x = last[0] - first[0];
          const v2y = last[1] - first[1];

          const v1dotv2 = v1x * v2x + v1y * v2y;
          const v1dotv1 = v1x * v1x + v1y * v1y;

          const x2 = (v1dotv2 / v1dotv1) * v1x;
          const y2 = (v1dotv2 / v1dotv1) * v1y;

          const x4 = v2x - x2;
          const y4 = v2y - y2;

          newCoordinates.push([x2 + first[0], y2 + first[1]]);
          newCoordinates.push(last);
          newCoordinates.push([x4 + first[0], y4 + first[1]]);
          newCoordinates.push(first);
        } else {
          newCoordinates.push(coordinates[1]);
        }

        if (!geometry) {
          geometry = new Polygon([newCoordinates]);
        } else {
          geometry.setCoordinates([newCoordinates]);
        }
        return geometry;
      },
    });

    this.map.addInteraction(drawPoly);

    drawPoly.on('drawend', (event: DrawEvent) => {
      console.log('draw end', event.feature.getGeometry());

      const panels: any = event.feature.getGeometry();
      const coords = panels.getCoordinates()[0];

      const widthV = this.getVector(coords[0], coords[1]);
      const heightV = this.getVector(coords[1], coords[2]);

      const width =
        Math.sqrt(widthV[0] * widthV[0] + widthV[1] * widthV[1]) * 1000;
      const height =
        Math.sqrt(heightV[0] * heightV[0] + heightV[1] * heightV[1]) * 1000;

      const azemuth = Math.PI * 1.5 - Math.atan2(heightV[1], heightV[0]);

      const panelsX = Math.floor(width / this.panelWidth);
      const panelsY = Math.floor(height / this.panelHeight);

      const panelCenterOffset = [
        Math.cos(azemuth) * this.panelCenter[0] -
          Math.sin(azemuth) * this.panelCenter[1],
        Math.sin(azemuth) * this.panelCenter[0] -
          Math.cos(azemuth) * this.panelCenter[1],
      ];

      console.log(
        width,
        height,
        panelsX,
        panelsY,
        (azemuth * 180) / Math.PI,
        panelCenterOffset
      );

      for (let y = 0; y < panelsY; y++) {
        for (let x = 0; x < panelsX; x++) {
          const panelCenter = [
            coords[0][0] +
              widthV[0] * ((this.panelWidth * x) / width) +
              heightV[0] * ((this.panelHeight * y) / height) +
              panelCenterOffset[0],
            coords[0][1] +
              widthV[1] * ((this.panelWidth * x) / width) +
              heightV[1] * ((this.panelHeight * y) / height) +
              panelCenterOffset[1],
          ];

          var geoimg = new Image({
            opacity: 0.7,
            source: new GeoImageSource({
              url: 'https://thumbs.dreamstime.com/b/solar-panel-vector-texture-vertical-solar-battery-solar-panel-vector-129084723.jpg',
              imageCenter: panelCenter,
              imageScale: [0.0017, 0.0017],
              imageRotate: Number(azemuth),
            }),
          });

          this.map.addLayer(geoimg);
        }
      }
    });

    const modify = new Modify({
      source: source,
      condition: (event) => {
        return primaryAction(event) && !platformModifierKeyOnly(event);
      },
      style: (feature) => {
        return feature.get('features').forEach((modifyFeature: any) => {
          const modifyGeometry = modifyFeature.get('modifyGeometry');
          if (modifyGeometry) {
            const point = (feature.getGeometry() as Polygon).getCoordinates();
            let modifyPoint = modifyGeometry.point;
            if (!modifyPoint) {
              modifyPoint = point;
              modifyGeometry.point = modifyPoint;
              modifyGeometry.geometry0 = modifyGeometry.geometry;
            }

            console.log('modifyGeometry: ', modifyGeometry, point, modifyPoint);
          }
        });
      },
    });

    modify.on('modifystart', (event) => {
      event.features.forEach((feature: any) => {
        feature.set(
          'modifyGeometry',
          { geometry: feature.getGeometry().clone() },
          true
        );
      });
    });

    modify.on('modifyend', (event) => {
      event.features.forEach((feature: any) => {
        const modifyGeometry = feature.get('modifyGeometry');
        if (modifyGeometry) {
          feature.setGeometry(modifyGeometry.geometry);
          feature.unset('modifyGeometry', true);
        }
      });
    });

    this.map.addInteraction(modify);

    const snap = new Snap({ source: source, edge: true, vertex: false });
    this.map.addInteraction(snap);
  }

  getVector(p1: number[], p2: number[]): number[] {
    return [p2[0] - p1[0], p2[1] - p1[1]];
  }
}
