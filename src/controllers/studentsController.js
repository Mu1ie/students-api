const students = [
  { id: 1, name: "Ali Hassan", age: 20, grade: "A" },
  { id: 2, name: "Sara Ahmed", age: 22, grade: "B" },
  { id: 3, name: "Omar Khalid", age: 21, grade: "A" },
];

exports.getAllStudents = (req, res) => {
    res.status(200).json(students);
};


exports.getStudentById = (req, res) => {
    const studentFound = students.find((student) => {
        return student.id === Number(req.params.id);
    });
    if (studentFound) {
        res.status(200).json(studentFound);  
    } else {
        res.status(404).json({ message : "Student not found"});
    } 
};


exports.createStudent = (req, res) => {
    const newStudent = req.body;
    newStudent.id = students[students.length - 1].id + 1;
    students.push(newStudent);
    res.status(201).json({ message : "Student added Successfully"});
};
