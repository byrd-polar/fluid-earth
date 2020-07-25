import { download, exit, OUTPUT_DIR } from './index.js';
import * as path from 'path';
import mapshaper from 'mapshaper';

let url = 'https://github.com/nvkelso/natural-earth-vector/raw/master/50m_physical/ne_50m_coastline.shp';

export function coastlines() {
  return download(url)
    .then(file => {
      let cmds = `-i ${file} -o ${OUTPUT_DIR} format=topojson`;
      console.log(`Converting to TopoJSON...\n<= ${file}\n=> ${OUTPUT_DIR}\n`);
      return mapshaper.runCommands(cmds);
    })
    .catch(err => {
      console.log(`Failed to covert to TopoJSON...\n=> ${err}`);
      exit();
    });
}
