
// Each Coin is worth $0.05
// You earn Points and coins for different action:

//  First Verified Redemption → 1000 points, 20 coins (Once per user)
// Additional Redemptions → 500 points, 2 coins (For every redemption after the first)

// Referring Someone to Join:
// Direct Referral → 500 points (When they join)
// Indirect Referral → 250 points (When their referral joins)

// Referring Someone Who Redeems:
// Direct Referral → 1000 points, 20 coins (When they redeem for the first time)
// Indirect Referral → 750 points (When their referral redeems for the first time)
// Sharing a Redemption → 250 points (Each time you share)
// Social Shares Leading to Redemption → 1000 points, 20 coins (If someone clicks your shared post, joins, and redeems)

// Watching Awareness Videos → 100 points (Per completed video)

export const coinValue = 0.05;

export const rewards = Object.freeze({
  redemption: Object.freeze({
    first: Object.freeze({
      points: 1000,
      coins: 20,
      amount: 20 * coinValue,
    }),
    additional: Object.freeze({
      points: 500,  
      coins: 2,
      amount: 2 * coinValue,
    }),
  }),
  referral: Object.freeze({
    direct: Object.freeze({
      join: 500, 
      redeem: Object.freeze({
        points: 1000, 
        amount: 20 * coinValue, 
      }),
    }),
    indirect: Object.freeze({
      join: 250,
      redeem: 750,
    }),
  }),
  sharing: Object.freeze({
    redemption: 250,
    socialShare: Object.freeze({
      points: 1000, 
      amount: 20 * coinValue,
    }),
  }),
  video: Object.freeze({
    awareness: 100,
  }),
});
