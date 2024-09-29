# Fluid Earth

[![A visualization of swirling winds over the United States and Canada](https://fluid-earth.byrd.osu.edu/images/banner.png)](https://fluid-earth.byrd.osu.edu/#gdata=wind+speed+at+500+mb&pdata=wind+at+500+mb&smode=false)

## About

Fluid Earth is developed and maintained by The Ohio State University's Byrd
Polar and Climate Research Center.

If you are interested in using Fluid Earth for educational purposes or
collaborating with us to develop Fluid Earth for a specific application, please
email [gravina.2@osu.edu](mailto:gravina.2@osu.edu).

For more information, visit the Help & About menu at
[Fluid Earth](https://fluid-earth.byrd.osu.edu/).

## Development

### Frontend-only setup

#### Prerequisites

- [git](https://git-scm.com/)
- [Node.js](https://nodejs.org)
- [pnpm](https://pnpm.io/installation#using-corepack)

```sh
git clone https://github.com/byrd-polar/fluid-earth
cd fluid-earth
pnpm install
pnpm run dev
```

Changes to files in `src` will be automatically displayed from the dev server.

### Local backend setup

#### Additional prerequisites

- [wgrib](https://www.cpc.ncep.noaa.gov/products/wesley/wgrib.html)
- [wgrib2](https://www.cpc.ncep.noaa.gov/products/wesley/wgrib2/)
- [NetCDF](https://www.unidata.ucar.edu/downloads/netcdf/)
- [Deno](https://deno.land/#installation)

First, complete the frontend-only setup.

Then, [create an account](https://cds.climate.copernicus.eu/) to
access CDS. Once logged in, [accept the Copernicus license](https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels-monthly-means?tab=download)
and use your [CDS API key](https://cds.climate.copernicus.eu/how-to-api) to
create a `.env` file in the root of this Git repository with the following
content, replacing the `X`s with your key:

```env
CDS_API_KEY=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
```

Similarly, [create an account](https://urs.earthdata.nasa.gov/users/new) to
access Earthdata, and add your username and password to `.env`:

```env
EARTHDATA_LOGIN=username:password
```

Finally, in a separate terminal tab/window:

```sh
pnpm run tera
```

To develop against the remote backend again (as in the frontend-only setup),
remove  the `public/tera` directory.

### Building frontend for production

```sh
pnpm run build
pnpm run preview
```

### Updating local development environment

```sh
git pull https://github.com/byrd-polar/fluid-earth
pnpm install
```

## Web component

Fluid Earth comes with a lightweight web component which can be included in
webpage contexts where the full application is not needed. Refer to the
[documentation](webcomponent/README.md) for more info on using the
web component.
