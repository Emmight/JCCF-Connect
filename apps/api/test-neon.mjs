import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
try {
  console.log(await sql`select now()`);
} catch (e) {
  console.error(e.sourceError?.cause?.errors?.map((x) => `${x.code} ${x.address}`) ?? e);
}
