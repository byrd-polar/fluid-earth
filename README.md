# FEV2r (Fluid Earth Viewer 2)

A potential successor to [FEVer](https://fever.byrd.osu.edu), making use of of
[WebGL](https://en.wikipedia.org/wiki/WebGL).

## Preview

[https://loving-morse-6b791c.netlify.app/](https://loving-morse-6b791c.netlify.app/)

Note: this site is built from the `preview` branch and may not reflect the
latest changes on the `master` branch.

## About

Fluid Earth Viewer (FEVer) is an interactive web application that allows you to
visualize current and past conditions of Earth’s atmosphere and oceans. FEVer is
developed and maintained by The Ohio State University's Byrd Polar and Climate
Research Center.

You can use FEVer to learn about the atmosphere and oceans by exploring the
daily conditions in places where you live, work, and play or examining whole
regions of the planet over years. In particular, FEVer provides hands-on
visualizations of conditions in polar regions, changes they are undergoing, and
connections between polar regions and the rest of the planet. Built on an
open-source application, FEVer is a vehicle for modern Earth science
communication, making information used by the scientific community accessible
and engaging to everyone. FEVer is explorable 24 hours a day, 7 days a week
using your computer, tablet, and smartphone.

You can see the current FEVer in action [here](https://fever.byrd.osu.edu).

If you are interested in using FEVer for educational purposes or collaborating
with us to develop FEVer for a specific application, please email
[gravina.2@osu.edu](mailto:gravina.2@osu.edu).

## Developer Information

### Prerequisites

- [git](https://git-scm.com/)
- [Node.js (version >= 14)](https://nodejs.org)
- [wgrib2](https://www.cpc.ncep.noaa.gov/products/wesley/wgrib2/)

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
