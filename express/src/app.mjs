import express from "express";
import { pool } from "./storage-mysql.mjs";

export const app = express();

const filterSubscribers = async () => {
  const client = pool.promise();
  const q = `
  select id, uuid, name, email
  from billboard.common_user
  order by id desc
  limit 1000
  `;
  const [result] = await client.query(q);
  return result;
}

const filterCvsByIds = async (ids) => {
  const client = pool.promise();
  const q = `
  select id, uuid, common_user_id, status, name, school, major, education, date_end
  from billboard.resume
  where common_user_id in (${ids})
  `;
  const [result] = await client.query(q);
  return result;
}

app.route("/octo-api/cv")
  .get(async (req, res) => {
    const subscribers = await filterSubscribers();
    const ids = subscribers.map((s) => s.id);
    const cvs = await filterCvsByIds(ids.join(","));
    const list = cvs.map((c) => {
      const subscriber = subscribers.filter((s) => s["id"] === c["common_user_id"]);
      if (subscriber && subscriber.length > 0) {
        c["subscriber"] = subscriber[0];
      }
      return c;
    });
    res.json(list);
  });