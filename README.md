# FEV2r (Fluid Earth Viewer 2)

A potential successor to [FEVer](https://fever.byrd.osu.edu), making use of of
[WebGL](https://en.wikipedia.org/wiki/WebGL).

## Prerequisites

- [git](https://git-scm.com/)
- [Node.js](https://nodejs.org)

## Get started

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

...then start [Rollup](https://rollupjs.org):

```bash
npm run dev
```

Navigate to [localhost:5000](http://localhost:5000). You should see your app
running. Edit a component file in `src`, save it, and the page should
automatically reload with your changes.


## Building and running in production mode

To create an optimised version of the app:

```bash
npm run build
```

You can run the newly built app with `npm run start`. This uses
[sirv](https://github.com/lukeed/sirv), which is included in your package.json's
`dependencies` so that the app will work when you deploy to platforms like
[Heroku](https://heroku.com).
