import { Datetime } from '../datetime.js';
import { download, get_json, post_json } from '../download.js';
import { typical_metadata, output_path } from '../utility.js';
import { rm } from 'fs/promises';
import { createGunzip } from 'zlib';
import 'dotenv/config'

const reference_datetime = Datetime.from('1992-10-05');

const shared_metadata = {
  width: 1201,
  height: 481,
  interval: 'custom:OSCAR',
  projection: 'OSCAR',
};

export async function forage(current_state, datasets) {
  let { date } = current_state;
  let dt = date
    ? Datetime.next_oscar_date(date)
    : reference_datetime.add({ days: 7001 });
  date = dt.to_iso_string();

  let metadatas = datasets.map(d => typical_metadata(d, dt, shared_metadata));

  let token = await get_token(process.env.EARTHDATA_LOGIN);
  let input = await download(
    'https://archive.podaac.earthdata.nasa.gov/'
    + 'podaac-ops-cumulus-protected/OSCAR_L4_OC_third-deg/'
    + `oscar_vel${dt.days_since(reference_datetime)}.nc.gz`,
    { headers: { Authorization: `Bearer ${token}` } },
    true,
    [createGunzip()],
  );

  await Promise.all(datasets.map(async dataset => {
    let output = output_path(dataset.output_dir, date);
    await dataset.convert(input, output, { variables: 'u,v' });
  }));
  await rm(input);

  return { metadatas, new_state: { date } };
}

// See: https://urs.earthdata.nasa.gov/documentation/for_users/user_token#api
const api_url = 'https://urs.earthdata.nasa.gov/api/users';

export async function get_token(earthdata_login) {
  let headers = { Authorization: `Basic ${btoa(earthdata_login)}` };

  let [{ access_token, expiration_date }] =
    await get_json(`${api_url}/tokens`, { headers });

  if (Datetime.now() > new Datetime(expiration_date).subtract({ days: 5 })) {
    let params = new URLSearchParams({ token: access_token });
    await post_json(`${api_url}/revoke_token?${params}`, {}, { headers });
    ({ access_token } = await post_json(`${api_url}/token`, {}, { headers }));
  }
  return access_token;
}
