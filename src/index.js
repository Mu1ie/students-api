const express = require("express");
const app = express();
const cors = require("cors"); 
const studentsRoutes  = require("./routes/studentsRoutes");
const port = 3000;

app.use(cors());
app.use(express.json());

app.use(studentsRoutes);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});