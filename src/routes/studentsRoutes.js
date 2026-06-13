const express = require("express");
const router = express.Router();
const studentsController = require("../controllers/studentsController");

router.get("/students", studentsController.getAllStudents);

router.get("/students/:id", studentsController.getStudentById);

router.post("/students", studentsController.createStudent);


module.exports = router;