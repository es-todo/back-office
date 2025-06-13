import express from "express";
import path from "node:path";
const app = express();
const port = 4000;

const dist_path = path.join(__dirname, "../../spa/dist");
app.use(express.static(dist_path));

app.get(/.*/, (_req, res) => {
  res.sendFile(`${dist_path}/index.html`);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${4000}`);
});
