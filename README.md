# [Fluid Earth](https://fluid-earth.byrd.osu.edu/)

## About

Fluid Earth is developed and maintained by The Ohio State University's Byrd
Polar and Climate Research Center.

If you are interested in using Fluid Earth for educational purposes or
collaborating with us to develop Fluid Earth for a specific application, please
email [gravina.2@osu.edu](mailto:gravina.2@osu.edu).

## Development

### Frontend-only setup

#### Prerequisites

- [git](https://git-scm.com/)
- [Node.js](https://nodejs.org)

```sh
git clone https://github.com/byrd-polar/fluid-earth
cd fluid-earth
npm install
npm run dev
```

Changes to files in `src` will be automatically displayed from the dev server.

### Local backend setup

#### Additional prerequisites

- [wgrib2](https://www.cpc.ncep.noaa.gov/products/wesley/wgrib2/)
- [NetCDF](https://www.unidata.ucar.edu/downloads/netcdf/)

Complete the frontend-only setup, then in a separate terminal tab/window:

```sh
npm run tera
```

To develop against the remote backend again (as in the frontend-only setup),
remove  the `public/tera` directory.

### Building frontend for production

```sh
npm run build
npm run preview
```

### Updating local development environment

```sh
git pull https://github.com/byrd-polar/fluid-earth
npm install
```

## Web component

Fluid Earth comes with a lightweight web component which can be included in
webpage contexts where the full application is not needed. Refer to the
[documentation](webcomponent/README.md) for more info on using the
web component.
