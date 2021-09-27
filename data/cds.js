import 'dotenv/config';
import { downloadCDS } from './utility.js';

downloadCDS('reanalysis-era5-single-levels', {
  product_type: 'reanalysis',
  format: 'grib',
  variable: '2m_temperature',
  year: '2021',
  month: '08',
  time: '00:00',
  day: '01',
}, process.env.CDS_API_KEY);
