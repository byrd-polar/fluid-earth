# Fluid Earth

The successor to [FEVer](https://fever.byrd.osu.edu), making use of of
[WebGL](https://en.wikipedia.org/wiki/WebGL). Codenamed `FEV2r`.

## Preview

[https://fev2r.netlify.app/](https://fev2r.netlify.app/)

Note: this site is built from the `preview` branch and may not reflect the
latest changes on the `master` branch.

## About

Fluid Earth is an interactive web application that allows you to visualize
current and past conditions of Earth’s atmosphere and oceans. Fluid Earth is
developed and maintained by The Ohio State University's Byrd Polar and Climate
Research Center.

You can use Fluid Earth to learn about the atmosphere and oceans by exploring
the daily conditions in places where you live, work, and play or examining whole
regions of the planet over years. In particular, Fluid Earth provides hands-on
visualizations of conditions in polar regions, changes they are undergoing, and
connections between polar regions and the rest of the planet. An open-source
application, Fluid Earth is a vehicle for modern Earth science communication,
making information used by the scientific community accessible and engaging to
everyone. Fluid Earth is explorable 24 hours a day, 7 days a week using your
computer, tablet, or smartphone.

If you are interested in using Fluid Earth for educational purposes or
collaborating with us to develop Fluid Earth for a specific application, please
email [gravina.2@osu.edu](mailto:gravina.2@osu.edu).

## Developer Information

### Prerequisites

- [git](https://git-scm.com/)
- [Node.js (version >= 14)](https://nodejs.org)
- [wgrib2](https://www.cpc.ncep.noaa.gov/products/wesley/wgrib2/)
- [NetCDF](https://www.unidata.ucar.edu/downloads/netcdf/)

### Getting started

Install the dependencies...

```bash
git clone <URL of this repo>
cd fev2r
npm install
```

...generate the data...

```bash
npm run data
```

...then start [Vite](https://vitejs.dev/):

```bash
npm run dev
```

Navigate to [localhost:3000](http://localhost:3000). You should see your app
running. Edit a component file in `src`, save it, and the page should
automatically reload with your changes.

### Updating local development environment

Pull from upstream (i.e. the repository at
[https://code.osu.edu/BPCRC/outreach/fev2r.git](https://code.osu.edu/BPCRC/outreach/fev2r.git))...

```bash
git pull <URL or name of upstream remote> master
```

...then ensure any changes to the dependencies and data are applied:

```bash
npm install
npm run clean
npm run data
```

### Building and running in production mode

To create an optimised version of the app:

```bash
npm run build:app
```

You can run the newly built app with `npm run preview`.

## Terms of Use

The Terms of Use are specified [here](LICENSE) +

The laws of the State of Ohio shall govern these Terms of Use and any disputes
relating to our site.

IF YOU DO NOT AGREE TO AND ACCEPT THESE TERMS OF USE YOU SHOULD NOT USE THE
SOFTWARE.
