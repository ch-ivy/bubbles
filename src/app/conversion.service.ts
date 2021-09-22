import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConversionService {
  constructor() {}

  degreesToRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  latLonToOffsets(latitude, longitude, mapWidth, mapHeight) {
    const FE = 180; // false easting
    const radius = mapWidth / (2 * Math.PI);

    const latRad = this.degreesToRadians(latitude);
    const lonRad = this.degreesToRadians(longitude + FE);

    const x = lonRad * radius;

    const yFromEquator = radius * Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    const y = mapHeight / 2 - yFromEquator;

    return { x, y };
  }
}

/* 
  target.overlay_.renderer_.renderedFeatures_[0].geometryChangeKey_.target
  target.overlay_.renderer_.renderedCenter_

*/
