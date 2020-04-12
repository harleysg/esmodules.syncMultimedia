const express = require("express");
const app = express();

/**
 * MIDDELWARES
 */
app.use(express.static(__dirname));
/**
 * HEROKU CONFIG
 */
const PORT = process.env.PORT || 3000;
app.get("/", function (req, res) {
	res.render("./dist/index.html");
});
app.listen(PORT, () => {
	console.log(` Puerto ${PORT} escuchando... `);
});
