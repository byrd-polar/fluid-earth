<script>
  import { Tabs, TabList, TabPanel, Tab } from './tabs/tabs.js';
  import Variables from './tabs/Variables.svelte';
  import Markers from './tabs/Markers.svelte';
  import Projections from './tabs/Projections.svelte';
  import Advanced from './tabs/Advanced.svelte';

  import List24 from "carbon-icons-svelte/lib/List24";
  import Location24 from "carbon-icons-svelte/lib/Location24";
  import Earth24 from "carbon-icons-svelte/lib/Earth24";
  import SettingsAdjust24 from "carbon-icons-svelte/lib/SettingsAdjust24";
</script>

<Tabs>
  <TabList>
    <Tab TabIcon={List24}>Variables</Tab>
    <Tab TabIcon={Location24}>Markers</Tab>
    <Tab TabIcon={Earth24}>Projection</Tab>
    <Tab TabIcon={SettingsAdjust24}>Advanced</Tab>
  </TabList>

  <TabPanel>
    <Variables/>
  </TabPanel>

  <TabPanel>
    <Markers/>
  </TabPanel>

  <TabPanel>
    <Projections/>
  </TabPanel>

  <TabPanel>
    <Advanced/>
  </TabPanel>
</Tabs>

<h2>Note</h2>
<p>
  The above controls are not yet fully implemented. They
  are intended to provide the correct behavior for the UI elements,
  to be associated with visualization events in the near future.
</p>

<style>
  h2, p {
    color: hsla(0, 0%, 100%, .8);
  }
</style>
