<!-- Range slider reference: https://github.com/simeydotme/svelte-range-slider-pips -->
<!-- https://github.com/6eDesign/svelte-calendar -->
<!-- https://www.creative-tim.com/learning-lab/svelte/datepicker/argon-dashboard -->
<script>
    import RangeSlider from "svelte-range-slider-pips";
    // import Radio from '@smui/radio';
    // import FormField from '@smui/form-field';
    import Button, {Label} from '@smui/button';
    import Select,{Option} from '@smui/select';
    import { fade } from 'svelte/transition';
    export let date;
	  let visible = false;
    const dates = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

    let options= ['2016', '2017', '2018', '2019','2020'];
  // let options = [
  //   {
  //     name: '2016',
  //     disabled: false
  //   },
  //   {
  //     name: '2017',
  //     disabled: false
  //   },
  //   {
  //     name: '2018',
  //     disabled: false
  //   },
  //   {
  //     name: '2019',
  //     disabled: false
  //   },
  //   {
  //     name: '2020',
  //     disabled: false
  //   }];
  function setVisible(){
     visible = !visible;
  }

  let selected = '2020';//year
  let minVal = 7;
  let maxVal = 8;
  let values = [minVal,maxVal];//month ranges

  /**Three today constants so will not keep on being modified after .setDate*/
  //  const today = new Date(); //actually todays date
  //  const btoday = new Date();//will be modified to be -6 days from today
  //  const ctoday = new Date();//will be modified to be +6 days from today
  // let minToday = btoday.setDate(btoday.getDate()-6);
  // let maxToday = ctoday.setDate(ctoday.getDate()+6);
/*****************/

/**only using the time provided– min and max is currently selected by user*/
let mid = date.update(d =>{d.setFullYear(selected,minVal);return d;});
//let mid = date.setFullYear(selected,minVal,15);//ew Date(selected,minVal,15);
// let minMon = btoday.setFullYear(selected,minVal);//btoday.setMonth(minVal);//min month
// let maxMon = ctoday.setFullYear(selected,maxVal);//ctoday.setMonth(maxVal);//max month

/**time in miliseconds */
   //let startToday = new Date(today).getTime()/1000;
   let milimid = new Date(mid).getTime()/1000;//new Date(mid).getTime()/1000;
   //let minDate = new Date(minToday).getTime();
  // let maxDate = new Date(maxToday).getTime();
/*****************/


   /**One day in miliseconds*/
   let stepOneDay = 86400;

  /**converts miliseconds into date string*/
  function dateString(millisec){
    return new Date(millisec);
  }

  function format(dateSt){
    let mNum = dates[dateSt.getMonth()];
    let dat = dateSt.getDate();
    let yr = dateSt.getFullYear();
    return [mNum,dat,yr].join("/");
  }

  function yearMT(year,monthNum){
    let updated = new Date (year,monthNum).getTime();
    date.update(d => {
     d.setDate(updated);
      return d;
    });
    return updated;
  }

</script>


            <section>
              <h2>Select year/ range of months to load</h2>


              <div class="columns margins" style="justify-content: flex-start;">
                <div>
                  <Select variant="filled" bind:value={selected} label="Select a Year">
                    <Option value=""></Option>
                    {#each options as option}
                      <Option value={option} selected={selected === option}>{option}</Option>
                    {/each}
                  </Select>

                  <p class="status">Selected: {selected}</p>
                </div>
            </section>

          <!-- Range of month Jan-Dec, will be used to determine min and max of time slider -->
           <section>
            <div style="--range-handle-focus: {'hsla(180, 100%, 25%, .8)'}; --range-range: {'hsla(180, 100%, 25%, .8)'}">
              <RangeSlider id='slider' float pips all= 'label' range bind:values={values} formatter={v => dates[v]} max={dates.length-1}/>
            </div>
            <div>
              <p class = "status"> Month Range: {dates[values[0]]} - {dates[values[1]]}</p>
              <div></div>
            </div>

              <!-- <input type="checkbox" bind:checked={visible}> -->
              <Button color="secondary" on:click={setVisible}>
                <Label>  Load!</Label>
              </Button>
            {#if visible}
            <div transition:fade>
            <h2>Select a date</h2>


            <div style="--range-handle-focus: {'hsla(180, 100%, 25%, .8)'}">
              <RangeSlider float pips first='label' last='label' rest={false} bind:value={milimid} min={yearMT(selected,values[0])} max={yearMT(selected,values[1])} step={stepOneDay} formatter={v => format(dateString(v))} handleFormatter={v => format(dateString(v))} />
            </div>
            <p>{format(dateString(milimid))}</p>

            <p class = "status">Date Range: {format(dateString(yearMT(selected,values[0])))}-{format(dateString(yearMT(selected,values[1])))}</p>
            </div>
            {/if}
          </section>
              <!-- <pre class = "status">updated: {format(dateString(milimid))}</pre> -->

<style>
  div {
    font-family: Quicksand-regular;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    margin-bottom: 0;
    cursor: pointer;
    list-style-type: none;
    padding: .5rem;
  }
  h2 {
    font-family: Quicksand-regular;
    font-size: 1.5rem;
    font-weight: 400;
    /* line-height: 1.5; */
    border-bottom: 1px solid;
  }
  p {
    font-family: Quicksand-regular;
    font-size: 1rem;
    font-weight: 400;
    /* line-height: 1.5; */
    /* border-bottom: 1px solid; */
  }
</style>
