<script>
  export let griddedData;
  export let griddedDomain;

  let datasets = [
    {
      name: 'surface temperature',
      path: '/data/gfs-temperature.f32',
      domain: [273.15 - 70, 273.15 + 70],
    },
    {
      name: 'u-wind velocity',
      path: '/data/gfs-u-wind.f32',
      domain: [-35, 35],
    },
    {
      name: 'v-wind velocity',
      path: '/data/gfs-v-wind.f32',
      domain: [-35, 35],
    },
    {
      name: 'wind speed',
      path: '/data/gfs-wind-speed.f32',
      domain: [0, 35],
    },
  ];
  let dataset = datasets[0];
  $: dataset, updateData();

  async function updateData() {
    let path = dataset.path;
    let buffer = await fetch(path).then(res => res.arrayBuffer());
    griddedData = {
      float32Array: new Float32Array(buffer),
      width: 1440,
      height: 721,
    }
    griddedDomain = dataset.domain;
  }
</script>

<label>Choose a dataset:
  <select bind:value={dataset} name="colormaps">
    {#each datasets as dataset}
      <option value={dataset}>{dataset.name}</option>
    {/each}
  </select>
</label>
<p>
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tempor tellus ligula, sed vulputate nisl finibus eu. Nullam facilisis tempus tortor in commodo. Vestibulum quam quam, malesuada non ornare ut, porttitor et sapien. Praesent eu ornare lorem. Maecenas porta porta enim eu vestibulum. Maecenas porttitor convallis magna, dignissim consequat elit consequat vitae. Fusce pellentesque, ligula eu sodales interdum, nulla felis pharetra turpis, sed tincidunt tortor mi quis diam. Proin tempor nec tellus sit amet faucibus. Donec ac urna in neque fermentum mollis nec sit amet ante. Vivamus non sapien eu quam sodales venenatis. Morbi in posuere ipsum, id auctor leo. Phasellus auctor dolor sed odio rhoncus efficitur. In ut nunc et diam laoreet maximus. Donec commodo turpis in ipsum auctor, eu vestibulum odio malesuada. Duis volutpat congue accumsan.
</p>
<p>
In sollicitudin porttitor dolor in vehicula. Maecenas diam nulla, tempus a luctus ac, fringilla id orci. Integer placerat suscipit finibus. Nam porta, nunc quis faucibus semper, orci metus porttitor nisi, vestibulum maximus enim lacus non velit. Vivamus pharetra dolor in quam tristique mattis. Sed sed ante pulvinar, commodo libero a, aliquam libero. Praesent nisi dolor, egestas quis lacinia eget, aliquam tincidunt metus. Nam sollicitudin bibendum neque. Nulla vel efficitur lacus.
</p>
<p>
Maecenas ac ullamcorper ante, quis pharetra mauris. Phasellus diam lacus, viverra vel felis sit amet, sagittis tristique neque. Fusce rhoncus tristique mattis. Quisque fringilla lectus in lorem varius, vel euismod sem euismod. Aliquam ornare mollis lectus, vitae semper leo pellentesque sit amet. Aliquam fermentum quam mollis, rutrum mauris ac, efficitur est. Cras diam odio, rutrum eu accumsan quis, vestibulum et orci. Etiam in bibendum justo, et maximus orci. Maecenas dictum tellus in libero dapibus, nec faucibus est venenatis.
</p>
<p>
Duis non lacus diam. Nunc consequat interdum purus ac molestie. Morbi dolor tellus, porta ac porttitor quis, vestibulum vel dui. In ac porta velit, a rhoncus ipsum. Mauris erat leo, lobortis non massa euismod, semper tempus magna. Donec sit amet pellentesque eros. Nunc eu elit at enim iaculis commodo sed eget lorem. Ut quis molestie augue, et convallis odio. Suspendisse feugiat, elit ac porta aliquet, lectus metus venenatis libero, a ornare sapien risus at mi. Quisque facilisis quam eu ornare maximus.
</p>
<p>
Cras volutpat, nibh in interdum vulputate, dolor neque venenatis arcu, ut elementum lectus sem vitae diam. Nullam tempus urna in sapien efficitur, in imperdiet lorem ultrices. Nam sed efficitur dolor. Nullam vel maximus tortor. Phasellus efficitur est neque, sed luctus nibh faucibus et. Phasellus congue massa lorem, ac aliquet ipsum blandit vel. Aliquam ac lorem dolor. Integer dignissim posuere orci in posuere. Phasellus dui orci, finibus vitae posuere vitae, vehicula in magna.
</p>

<style>
  label {
    padding-top: 1em;
    display: block;
  }

  select {
    height: 2.5em;
  }
</style>
