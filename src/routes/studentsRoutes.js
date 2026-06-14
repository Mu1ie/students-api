const express = require("express");
const router = express.Router();
const studentsController = require("../controllers/studentsController");

router.get("/students", studentsController.getAllStudents);

router.get("/students/:id", studentsController.getStudentById);

router.post("/students", studentsController.createStudent);

router.put("/students/:id", studentsController.updateStudent);

router.delete("/students/:id", studentsController.deleteStudent);


module.exports = router;