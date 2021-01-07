<script>
  import Button from '../components/Button.svelte';

</script>

<h2>Introduction</h2>

<p>
  Help us improve FEVer by providing us with your feedback.
</p>
<p>
  Tell us what you like or don't like, what works or doesn't work, what features
  you would like added, etc.
</p>
<p>
  Feedback from the community and educators has helped make this project a
  success.
</p>

<h2>Feedback Form</h2>

<!--
  See https://docs.netlify.com/forms/setup/

  If changing the number or type of inputs, be sure to modify the corresponding
  form in public/form.html
-->

<form name="feedback" method="POST" data-netlify="true">
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
  <Button type="submit">Submit Feedback</Button>
</form>

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
    background-color: #464646;
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
