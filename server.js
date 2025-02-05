const dbConnnection = require("./src/config/db.js");
const app = require("./app.js");

const PORT = process.env.PORT;

dbConnnection()
  .then(() => {
    app.listen(PORT, () => console.log(`Server is running at PORT: ${PORT}`));
  })
  .catch((error) => {
    console.log("MongoBD connection Failed!!! ", error);
  });
