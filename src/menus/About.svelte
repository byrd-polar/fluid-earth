<!-- Note: this file intentionally omits optional closing html tags such as
</p>, </dt>, and </dd> to reduce some of the tag clutter. -->

<script>
  export let kioskMode;

  let content;
  $: links = content ? content.querySelectorAll('a') : [];

  $: if (kioskMode) {
    for (let link of links) {
      let href = link.getAttribute('href');
      link.textContent = `${link.textContent} [${href}]`
      link.removeAttribute('href');
    }
  } else {
    for (let link of links) {
      let [text, href] = link.textContent.split(/ \[|\]/);
      if (href) {
        link.textContent = text;
        link.setAttribute('href', href);
      }
    }
  }
</script>

<div bind:this={content}>

{#if !kioskMode}

<details open>
<summary><h2>Tutorial Video</h2></summary>
<iframe
  src="https://player.vimeo.com/video/579263200"
  title="Quick tutorial video for Fluid Earth"
  allowfullscreen
></iframe>
</details>

<details open>
<summary><h2>Previous Version</h2></summary>
<p>
This is the second major iteration of the Fluid Earth project. The previous
version, <a href="https://fever.byrd.osu.edu"> Fluid Earth Viewer</a>, has
weather data from earlier years and climate data that we are still working on
adding to this new version, Fluid Earth. If you need to access this data, or
really liked the previous version's look and feel, click the link above to get
redirected.
</details>

{/if}

<details open={kioskMode}>
<summary><h2>The Project</h2></summary>
<p>
Fluid Earth is an interactive web application that allows you to visualize
current and past conditions of Earth's atmosphere and oceans.
<p>
You can use Fluid Earth to learn about the atmosphere and oceans by exploring
the daily conditions in places where you live, work, and play or examining whole
regions of the planet over years. In particular, Fluid Earth provides hands-on
visualizations of conditions in polar regions, changes they are undergoing, and
connections between polar regions and the rest of the planet. An open-source
application, Fluid Earth is a vehicle for modern Earth science communication,
making information used by the scientific community accessible and engaging to
everyone. Fluid Earth is explorable 24 hours a day, 7 days a week using your
computer, tablet, or smartphone.
<p>
Our project team is working to remove obstacles to learning about our dynamic
planet, Earth!
</details>

<details>
<summary><h2>Fluid Earth in action</h2></summary>
<p>
To learn about the latest Fluid Earth developments, visit our
<a href="https://u.osu.edu/fever/">blog</a>, or our
<a href="https://vimeo.com/showcase/5395248">video collection</a> showcasing
weather and climate phenomena using Fluid Earth. Or just jump in and start
exploring on your own!
</details>

<details>
<summary><h2>Our Sponsor</h2></summary>
<p>
This project is sponsored by the U.S. National Science Foundation as an
Exploratory Pathways project under the <a
href="https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=504793">Advancing
Informal STEM Learning</a> (AISL) Program.
</details>

<details>
<summary><h2>The Team</h2></summary>
<p>
The team is comprised of multi-disciplinary researchers and educators from The
Ohio State University committed to improving Earth Science and learning
strategies in diverse education settings.
<p>
Members from OSU's <a href="https://byrd.osu.edu/">Byrd Polar and Climate
Research Center</a> (BPCRC) bring their expertise in education and outreach,
polar weather and climate, and computer information sciences. The team is also
fortunate to have a member from OSU's School of Communication with a wealth of
knowledge on user-testing and the effects and implications of new media
technologies and virtual environments. Together, this team has extensive
experience communicating with public audiences of all ages.
<dl>
  <dt>Jason Cervenec (PI)
  <dd><img src="/images/cervenec.png" height="100" width="100" loading="lazy"
           alt="portrait of Jason">
  <dd><i>BPCRC Education &amp; Outreach Director</i>
  <dd>Oversees project and creation and field-testing of learning experiences

  <dt>Jesse Fox
  <dd><img src="/images/fox.png" height="100" width="100" loading="lazy"
           alt="portrait of Jesse">
  <dd><i>School of Communication Associate Professor</i>
  <dd>Oversees user-testing and virtual environment settings

  <dt>Bidhyananda Yadav
  <dd><img src="/images/yadav.png" height="100" width="100" loading="lazy"
           alt="portrait of Bidhya">
  <dd><i>BPCRC Research Associate</i>
  <dd>Oversees code development and collaborates with J. Cervenec on
    field-testing and learning experiences

  <dt>Aaron Wilson
  <dd><img src="/images/wilson.png" height="100" width="100" loading="lazy"
           alt="portrait of Aaron">
  <dd><i>BPCRC Senior Research Associate</i>
  <dd>Collaborates with B. Yadav on code development and with J. Cervenec on
    field-testing and learning experiences

  <dt>Michael Gravina
  <dd><img src="/images/gravina.png" height="100" width="100" loading="lazy"
           alt="portrait of Mike">
  <dd><i>Front-End Developer</i>
  <dd>Collaborates with B. Yadav on code development and with J. Cervenec on
    field-testing and learning experiences

  <dt>Em Zhan
  <dd><img src="https://avatars.githubusercontent.com/u/47396035"
           height="100" width="100" loading="lazy"
           alt="portrait of Em">
  <dd><i>Front-End and Full-Stack Developer</i>
  <dd>Writes and maintains the code
</dl>
<div style="clear: both"></div>
<p>
In addition, the team depends on a talented group of undergraduates and Research
Experience for Undergraduates (REU) students working at The Ohio State
University to assist in designing the user interface, conducting user-testing,
organizing data, and producing tutorials: Bingyu (Sophia) Li, Dingyu Hu, Ruiyang
Chang, Joey Wong, Craig Bossley, Mimi Cai, Adelyn Arens, Devan Agrawal, Daniel
Hamilton, and Shaniqwa Martin.
<p>
Finally, we'd like to thank the following people from the BPCRC for their
technical expertise in support of the project: Tom Kassebaum and Pam Theodotou.
</details>

<details>
<summary><h2>Data Sources</h2></summary>
<p>
Fluid Earth utilizes an enormous amount of scientifically complex data, allowing you
to explore the interconnectedness of weather and climate, including between
polar regions and the rest of the planet.
<p>
Data sources include:
<dl>
  <dt>Weather
  <dd><a href="https://www.emc.ncep.noaa.gov/emc/pages/numerical_forecast_systems/gfs.php">
    Global Forecast System</a> (GFS)

  <dt>Ocean Currents
  <dd><a href="https://www.esr.org/research/oscar/oscar-surface-currents/">
    Ocean Surface Current Analysis Real-time</a> (OSCAR)

  <dt>Sea Surface Temperature
  <dd><a href="https://www.nco.ncep.noaa.gov/pmb/products/sst/">
    Real Time Global Sea Surface Temperature</a> (RTGSST)

  <dt>Gases and Aerosols
  <dd><a href="https://gmao.gsfc.nasa.gov/GEOS_systems/">
    Goddard Earth Observing System</a> (GEOS)
</dl>
</details>

<details>
  <summary><h2>Terms of Use</h2></summary>
<p>
Copyright 2021 The Ohio State University
<p>
Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:
<p>
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
<p>
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
<p>
The laws of the State of Ohio shall govern these Terms of Use and any disputes
relating to our site.
<p>
IF YOU DO NOT AGREE TO AND ACCEPT THESE TERMS OF USE YOU SHOULD NOT USE THE
SOFTWARE.
</details>

<details>
<summary><h2>Third-party libraries</h2></summary>
<p>
Fluid Earth contains code from third-party libraries. We are very grateful to
the authors of these libraries as this project would not be possible without
their contributions to open-source.
<p>
As required, here are the
<a href="/legal/THIRD_PARTY">licence texts</a> for
and
<a href="/legal/MODIFICATIONS">modifications</a> to
these libraries.
<p>
Location search data in the Markers menu is from the
"<a href="https://simplemaps.com/data/world-cities">
Basic World Cities Database v1.73</a>" by
<a href="https://simplemaps.com">Pareto Software, LLC</a>, used under
<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>
with text reformatted from original.
</details>

</div>

<style>
  details {
    margin-bottom: 1em;
  }

  summary {
    cursor: pointer;
    border-bottom: 1px solid;
  }

  summary h2 {
    display: inline;
    border-bottom: none;
  }

  iframe {
    all: unset;
    width: 100%;
    aspect-ratio: 16 / 9;
    margin-top: 1em;
  }

  dt {
    font-weight: bold;
    clear: both;
    margin-top: 1em;
  }

  dd {
    margin-inline-start: 1em;
  }

  img {
    float: right;
    border-radius: 50%;
    margin: -1.5em 1em 1em 1em;
  }
</style>
