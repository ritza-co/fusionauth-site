<script setup>
import { ref } from 'vue';

var coins = {
  quarters: 0.25,
  dimes: 0.1,
  nickels: 0.05,
  pennies: 0.01,
};

const message = ref('');
const amount = ref(0);

const onMakeChange = (event) => {
  event.preventDefault();

  try {
    message.value = 'We can make change for';

    let remainingAmount = amount.value;
    for (const [name, nominal] of Object.entries(coins)) {
      let count = Math.floor(remainingAmount / nominal);
      remainingAmount =
        Math.ceil((remainingAmount - count * nominal) * 100) / 100;

      message.value = `${message.value} ${count} ${name}`;
    }
    message.value = `${message.value}!`;
  } catch (ex) {
    message.value = `There was a problem converting the amount submitted. ${ex.message}`;
  }
};
</script>
<template>
  <section>
    <div :style="{ flex: '1' }">
      <div class="column-container">
        <div class="app-container change-container">
          <h3>We Make Change</h3>
          <div class="change-message">{{ message }}</div>
          <form @submit="onMakeChange">
            <div class="h-row">
              <div class="change-label">Amount in USD: $</div>
              <input
                class="change-input"
                type="number"
                step="0.01"
                name="amount"
                :value="amount"
                @input="(event) => (amount = event.target.value)"
              />
              <input class="change-submit" type="submit" value="Make Change" />
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>
