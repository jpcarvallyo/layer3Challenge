"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalRewardsInUSDWC = exports.getTotalRewardInUSD = void 0;
const axios_1 = __importDefault(require("axios"));
const utils_1 = require("../utils");
const cache = new Map();
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
function getTotalRewardInUSD(date, coin) {
    return __awaiter(this, void 0, void 0, function* () {
        // Function to fetch ETH price from Coingecko API
        const response = yield axios_1.default.get(`https://api.coingecko.com/api/v3/coins/${coin}/history?date=${date}`);
        // Parse the API response and extract the ETH price
        return response.data.market_data.current_price.usd;
    });
}
exports.getTotalRewardInUSD = getTotalRewardInUSD;
// NOTE:
// PRO --> Function leverages Cache. User may completed many quests on same day, reduces number of calls to Coingecko API, saves $$$.
// CON --> No parallel fetching
function getTotalRewardsInUSDWC(items, coin) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const item of items) {
            const completedAtDate = new Date(item.completed_at)
                .toISOString()
                .split("T")[0];
            item.completed_at = (0, utils_1.formatDate)(completedAtDate);
            const date = item.completed_at;
            const cachedPrice = cache.get(date);
            if (cachedPrice !== undefined) {
                // Use the cached result and augment the item;
                item.eth_reward_in_usd = cachedPrice;
            }
            else {
                const response = yield axios_1.default.get(`https://api.coingecko.com/api/v3/coins/${coin}/history?date=${date}`);
                const price = response.data.market_data.current_price.usd;
                item.eth_reward_in_usd = price;
                // Update the cache with the new result
                cache.set(date, price);
            }
        }
        return items;
    });
}
exports.getTotalRewardsInUSDWC = getTotalRewardsInUSDWC;
