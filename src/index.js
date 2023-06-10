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
const express_1 = __importDefault(require("express"));
const pg_1 = require("pg");
const retrieveCryptoPrice_1 = require("./services/retrieveCryptoPrice");
const app = (0, express_1.default)();
const port = 3000;
// Configure the PostgreSQL connection
const pool = new pg_1.Pool({
    user: "postgres",
    password: "",
    host: "localhost",
    port: 5432,
    database: "mydatabase",
});
// Retrieve the 10 most popular quests based on the number of claims
app.get("/quests/popular", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const popularQuestsQuery = `
      SELECT q.id, q.name, COUNT(qc.id) AS claim_count
      FROM quests q
      JOIN quest_completions qc ON qc.quest_id = q.id
      GROUP BY q.id, q.name
      ORDER BY claim_count DESC
      LIMIT 10;
    `;
        const { rows } = yield pool.query(popularQuestsQuery);
        res.json(rows);
    }
    catch (error) {
        console.error("Error retrieving popular quests:", error);
        res
            .status(500)
            .json({ error: "An error occurred while retrieving popular quests" });
    }
}));
// Retrieve the top 10 quests that have paid out the most ETH to users
app.get("/quests/top-payouts", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const topPayoutsQuery = `
      SELECT q.id, q.name, SUM(q.eth_reward) AS total_payout
      FROM quests q
      JOIN quest_completions qc ON qc.quest_id = q.id
      GROUP BY q.id, q.name
      ORDER BY total_payout DESC
      LIMIT 10;
    `;
        const { rows } = yield pool.query(topPayoutsQuery);
        res.json(rows);
    }
    catch (error) {
        console.error("Error retrieving top payouts:", error);
        res
            .status(500)
            .json({ error: "An error occurred while retrieving top payouts" });
    }
}));
// Show the total reward in ETH for a given user ID
app.get("/users/:userId/total-reward", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { userId } = req.params;
    try {
        const totalRewardQuery = `
      SELECT COALESCE(SUM(q.eth_reward), 0) AS total_reward
      FROM quests q
      WHERE EXISTS (
        SELECT 1
        FROM quest_completions qc
        WHERE qc.quest_id = q.id
          AND qc.user_id = $1
      );
    `;
        const { rows } = yield pool.query(totalRewardQuery, [userId]);
        const totalReward = ((_a = rows[0]) === null || _a === void 0 ? void 0 : _a.total_reward) || 0;
        res.json({ total_reward: totalReward });
    }
    catch (error) {
        console.error("Error retrieving total reward:", error);
        res
            .status(500)
            .json({ error: "An error occurred while retrieving total reward" });
    }
}));
// Show the total reward in USD for a given user ID (based on the USD price of ETH when the quest is claimed). You can use your API of choice to retrieve the historical prices of ETH.
// Making the assumption that completed_at and CLAIMED is the same
app.get("/users/:userId/total-reward-usd", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const totalRewardQuery = `
      SELECT qc.*, q.eth_reward
      FROM quest_completions qc
      JOIN quests q ON qc.quest_id = q.id
      WHERE qc.user_id = $1;
    `;
        const { rows } = yield pool.query(totalRewardQuery, [userId]);
        const userCompletedQuestsWithRewards = yield (0, retrieveCryptoPrice_1.getTotalRewardsInUSDWC)(rows, "ethereum");
        const totalRewardUSD = userCompletedQuestsWithRewards.reduce((prev, curr) => (prev += curr.eth_reward_in_usd * curr.eth_reward), 0);
        res.json({ total_reward_usd: totalRewardUSD });
    }
    catch (error) {
        console.error("Error retrieving total reward in USD:", error);
        res.status(500).json({
            error: "An error occurred while retrieving total reward in USD",
        });
    }
}));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
