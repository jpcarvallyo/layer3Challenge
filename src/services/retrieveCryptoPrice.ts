import axios from "axios";
import { formatDate } from "../utils";
const cache = new Map();

interface questJoin {
  id: number;
  user_id: number;
  quest_id: number;
  completed_at: string;
  claimed_at: Date;
  eth_reward: number;
  eth_reward_in_usd: number;
}

// NOTE:
// PRO --> It may be slightly faster due to parallel fetching.
// CON --> DOES NOT leverage cache
// * Example code for how to use function within routes
// // Create an array of Promises for each fetch call
// const userCompletedQuestsWithRewards = rows.map(
//   async (item) => {
//      const completedAtDate = new Date(item.completed_at)
//          .toISOString()
//          .split("T")[0];
//   item.completed_at = formatDate(completedAtDate);
//   item.eth_reward_in_usd = await getTotalRewardInUSD(
//       item.completed_at,
//       "ethereum"
//   );
//   return item;
//   }
// );
// // Execute all fetch calls and store the results in an array
// const ethPrices = await Promise.all(userCompletedQuestsWithRewards);
// const totalRewardUSD = ethPrices.reduce(
//   (prev, curr) => (prev += curr.eth_reward_in_usd * curr.eth_reward),
//   0
// );
export async function getTotalRewardInUSD(date: string, coin: string) {
  // Function to fetch ETH price from Coingecko API
  const response = await axios.get(
    `https://api.coingecko.com/api/v3/coins/${coin}/history?date=${date}`
  );
  // Parse the API response and extract the ETH price
  return response.data.market_data.current_price.usd;
}

// NOTE:
// PRO --> Function leverages Cache. User may completed many quests on same day, reduces number of calls to Coingecko API, saves $$$.
// CON --> No parallel fetching
export async function getTotalRewardsInUSDWC(
  items: questJoin[],
  coin: string
): Promise<questJoin[]> {
  for (const item of items) {
    const completedAtDate = new Date(item.completed_at)
      .toISOString()
      .split("T")[0];
    item.completed_at = formatDate(completedAtDate);
    const date = item.completed_at;
    const cachedPrice = cache.get(date);

    if (cachedPrice !== undefined) {
      // Use the cached result and augment the item;
      item.eth_reward_in_usd = cachedPrice;
    } else {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${coin}/history?date=${date}`
      );
      const price = response.data.market_data.current_price.usd;
      item.eth_reward_in_usd = price;

      // Update the cache with the new result
      cache.set(date, price);
    }
  }

  return items;
}
