import { RabbitSanctuary } from './rabbit-sanctuary.js';
import { watch } from 'chokidar';

let rc = new RabbitSanctuary();

watch('./sources')
  .on('add', path => rc.add(relativize(path)))
  .on('unlink', path => rc.remove(relativize(path)));

function relativize(path) {
  return `./${path}`;
}
