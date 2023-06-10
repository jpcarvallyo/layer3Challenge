import express from "express";
import { Pool } from "pg";
import { getTotalRewardsInUSDWC } from "./services/retrieveCryptoPrice";

const app = express();
const port = 3000;

// Configure the PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  password: "",
  host: "localhost",
  port: 5432,
  database: "mydatabase",
});

// Retrieve the 10 most popular quests based on the number of claims
app.get("/quests/popular", async (req, res) => {
  try {
    const popularQuestsQuery = `
      SELECT q.id, q.name, COUNT(qc.id) AS claim_count
      FROM quests q
      JOIN quest_completions qc ON qc.quest_id = q.id
      GROUP BY q.id, q.name
      ORDER BY claim_count DESC
      LIMIT 10;
    `;

    const { rows } = await pool.query(popularQuestsQuery);
    res.json(rows);
  } catch (error) {
    console.error("Error retrieving popular quests:", error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving popular quests" });
  }
});

// Retrieve the top 10 quests that have paid out the most ETH to users
app.get("/quests/top-payouts", async (req, res) => {
  try {
    const topPayoutsQuery = `
      SELECT q.id, q.name, SUM(q.eth_reward) AS total_payout
      FROM quests q
      JOIN quest_completions qc ON qc.quest_id = q.id
      GROUP BY q.id, q.name
      ORDER BY total_payout DESC
      LIMIT 10;
    `;

    const { rows } = await pool.query(topPayoutsQuery);
    res.json(rows);
  } catch (error) {
    console.error("Error retrieving top payouts:", error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving top payouts" });
  }
});

// Show the total reward in ETH for a given user ID
app.get("/users/:userId/total-reward", async (req, res) => {
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

    const { rows } = await pool.query(totalRewardQuery, [userId]);
    const totalReward = rows[0]?.total_reward || 0;
    res.json({ total_reward: totalReward });
  } catch (error) {
    console.error("Error retrieving total reward:", error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving total reward" });
  }
});

// Show the total reward in USD for a given user ID (based on the USD price of ETH when the quest is claimed). You can use your API of choice to retrieve the historical prices of ETH.

// Making the assumption that completed_at and CLAIMED is the same
app.get("/users/:userId/total-reward-usd", async (req, res) => {
  const { userId } = req.params;

  try {
    const totalRewardQuery = `
      SELECT qc.*, q.eth_reward
      FROM quest_completions qc
      JOIN quests q ON qc.quest_id = q.id
      WHERE qc.user_id = $1;
    `;
    const { rows } = await pool.query(totalRewardQuery, [userId]);

    const userCompletedQuestsWithRewards = await getTotalRewardsInUSDWC(
      rows,
      "ethereum"
    );

    const totalRewardUSD = userCompletedQuestsWithRewards.reduce(
      (prev, curr) => (prev += curr.eth_reward_in_usd * curr.eth_reward),
      0
    );

    res.json({ total_reward_usd: totalRewardUSD });
  } catch (error) {
    console.error("Error retrieving total reward in USD:", error);
    res.status(500).json({
      error: "An error occurred while retrieving total reward in USD",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
