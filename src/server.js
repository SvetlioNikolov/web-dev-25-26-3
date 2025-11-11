const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const AppDataSource = require("./config/database");
const universityRoutes = require("./routes/universityRoutes");
const studentRoutes = require("./routes/studentRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/universities", universityRoutes);
app.use("/api/students", studentRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Student-University API Server",
    endpoints: {
      universities: {
        "POST /api/universities": "Create a new university",
        "GET /api/universities": "Get all universities",
        "GET /api/universities/:id": "Get a university by ID",
        "PUT /api/universities/:id": "Update a university",
        "DELETE /api/universities/:id": "Delete a university",
      },
      students: {
        "POST /api/students": "Create a new student",
        "GET /api/students": "Get all students",
        "GET /api/students/:id": "Get a student by ID",
        "PUT /api/students/:id": "Update a student by ID",
        "DELETE /api/students/:id": "Delete a student by ID"
      },
    },
  });
});

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to database:", error);
  });

module.exports = app;
