<script>
  import Button from '../components/Button.svelte';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  let form, formSubmittedSuccessfully;
  let formSubmitted = false;

  onMount(() => form.addEventListener('submit', handleSubmit));

  async function handleSubmit(e) {
    e.preventDefault();
    let res = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)),
    });

    formSubmitted = true;
    formSubmittedSuccessfully =
      res.ok && window.location.hostname !== 'fluid-earth.byrd.osu.edu';

    if (!formSubmittedSuccessfully) console.error(res);
  }
</script>

<details open>
<summary><h2>Introduction</h2></summary>
<p>
  Help us improve Fluid Earth by providing us with your feedback.
  Tell us what you like or don't like, what works or doesn't work, what features
  you would like added, etc.
  Feedback from the community and educators has helped make this project a
  success.
</p>
</details>

<details open>
<summary><h2>Feedback Form</h2></summary>
<!--
  See https://docs.netlify.com/forms/setup/

  If changing the number or type of inputs, be sure to modify the corresponding
  form in public/form.html
-->
<form name="feedback" method="POST" data-netlify="true" bind:this={form}>
  <input type="hidden" name="form-name" value="feedback" />
  <label>
    Name: <input type="text" name="name" autocomplete="off"/>
  </label>
  <label class="email">
    Email: <input type="email" name="email" />
  </label>
  <label class="sbj">
    Subject: <input type="text" name="subject" autocomplete="off"/>
  </label>
  <label class="msg">
    Message: <textarea name="message"></textarea>
  </label>
  {#if !formSubmitted}
    <Button type="submit">Submit Feedback</Button>
  {/if}
</form>
{#if formSubmitted}
  <div transition:fade>
    {#if formSubmittedSuccessfully}
      Form submitted successfully. Thank you for your feedback!
    {:else}
      <p>There was a problem with submitting the form; please email
      <a href="mailto:gravina.2@osu.edu">gravina.2@osu.edu</a> with your
      feedback instead.
      <p>Thank you, and apologies for the inconvenience.</p>

      <!-- svelte-ignore missing-declaration -->
      {#if !__production__}
        <p><strong>NOTE:</strong> Form submission is only expected to work when
        hosted on Netlify. (This note is not visible in production.)</p>
      {/if}
    {/if}
  </div>
{/if}
</details>

<style>
  form {
    display: grid;
    grid-template-columns: 50% 50%;
    row-gap: 0.5em;
  }

  label {
    display: flex;
    flex-direction: column;
  }

  label.email {
    margin-left: 0.5em;
  }

  label.sbj, label.msg, form :global(button) {
    grid-column-start: span 2;
  }

  input, textarea {
    font: inherit;
    color: white;
    background-color: var(--input-color);
    border: none;
    border-radius: 4px;
  }

  input {
    padding: 0 0.25em;
    height: 2em;
  }

  textarea {
    resize: vertical;
    padding: 0.25em;
    min-height: 2em;
    height: 16em;
  }
</style>
