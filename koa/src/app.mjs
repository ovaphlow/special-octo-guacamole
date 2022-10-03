import Koa from "koa";
import bodyParser from "koa-bodyparser";
import Router from "@koa/router";
import { pool } from "./storage-mysql.mjs";

export const app = new Koa();

app.use(bodyParser({ jsonLimit: "16mb" }));

const router = new Router();

const endpointCv = async (ctx) => {
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
  ctx.response.body = list;
}

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

(() => {
  router.get("/octo-api/cv", endpointCv);
})();

app.use(router.routes());
app.use(router.allowedMethods());