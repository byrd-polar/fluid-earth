import { RabbitSanctuary } from './rabbit-sanctuary.js';
import { absolute_path } from './utility.js';
import { watch } from 'chokidar';

let rs = new RabbitSanctuary();

watch(absolute_path('./sources'))
  .on('add', path => rs.add(path))
  .on('unlink', path => rs.remove(path));
