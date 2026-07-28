'use client';

import { useEffect, useState } from 'react';

var coins = {
  quarters: 25,
  dimes: 10,
  nickels: 5,
  pennies: 1,
};

export default function MakeChangeForm() {
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState(0);
  useEffect(() => {
    setMessage('');
    setAmount(0);
  }, []);

  const onMakeChange = (event: any) => {
    event.preventDefault();

    try {
      setMessage('We can make change for');

      let remainingCents = Math.round(amount * 100);
      for (const [name, nominal] of Object.entries(coins)) {
        let count = Math.floor(remainingCents / nominal);
        remainingCents = remainingCents - count * nominal;

        setMessage((m) => `${m} ${count} ${name}`);
      }
      setMessage((m) => `${m}!`);
    } catch (ex: any) {
      setMessage(
        `There was a problem converting the amount submitted. ${ex.message}`
      );
    }
  };

  return (
    <section>
      <div style={{ flex: '1' }}>
        <div className="column-container">
          <div className="app-container change-container">
            <h3>We Make Change</h3>
            <div className="change-message">{message}</div>
            <form onSubmit={onMakeChange}>
              <div className="h-row">
                <div className="change-label">Amount in USD: $</div>
                <input
                  className="change-input"
                  type="number"
                  step={0.01}
                  name="amount"
                  value={amount}
                  onChange={(e) => setAmount(+e.target.value)}
                />
                <input
                  className="change-submit"
                  type="submit"
                  value="Make Change"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
