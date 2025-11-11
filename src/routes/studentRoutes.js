const express = require("express");
const router = express.Router();
const AppDataSource = require("../config/database");

router.post("/", async (req, res) => {
  try {
    const { facultyNumber, firstName, middleName, lastName, universityId } = req.body;

    if (!facultyNumber || !firstName || !lastName || !universityId) {
      return res.status(400).json({
        error: "Faculty number, first name, last name, and university ID are required",
      });
    }

    const universityRepo = AppDataSource.getRepository("University");
    const university = await universityRepo.findOne({
      where: { id: parseInt(universityId) },
    });

    if (!university) {
      return res.status(404).json({ error: "University not found" });
    }

    const studentRepo = AppDataSource.getRepository("Student");
    const student = studentRepo.create({
      facultyNumber,
      firstName,
      middleName,
      lastName,
      university,
    });

    const savedStudent = await studentRepo.save(student);
    const result = await studentRepo.findOne({
      where: { id: savedStudent.id },
      relations: ["university"],
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const studentRepo = AppDataSource.getRepository("Student");
    const students = await studentRepo.find({
      relations: ["university"],
    });

    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const studentRepo = AppDataSource.getRepository("Student");
    const student = await studentRepo.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ["university"],
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const { facultyNumber, firstName, middleName, lastName, universityId } = req.body;

    const studentRepo = AppDataSource.getRepository("Student");
    const universityRepo = AppDataSource.getRepository("University");

    const student = await studentRepo.findOne({
      where: { id: studentId },
      relations: ["university"],
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // If universityId is provided, validate it
    if (universityId !== undefined) {
      const foundUniversity = await universityRepo.findOne({
        where: { id: parseInt(universityId) },
      });

      if (!foundUniversity) {
        return res.status(404).json({ error: "University not found" });
      }

      student.university = foundUniversity;
    }

    // Update optional fields
    if (facultyNumber !== undefined) student.facultyNumber = facultyNumber;
    if (firstName !== undefined) student.firstName = firstName;
    if (middleName !== undefined) student.middleName = middleName;
    if (lastName !== undefined) student.lastName = lastName;
    
    //Check for unique
    if (facultyNumber) {
      const existing = await studentRepo.findOne({ where: { facultyNumber } });
      if (existing && existing.id !== student.id) {
        return res.status(400).json({ error: "Faculty number must be unique" });
      }
    }

    // Save updates
    await studentRepo.save(student);

    // Return updated record with relations
    const updatedStudent = await studentRepo.findOne({
      where: { id: studentId },
      relations: ["university"],
    });

    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --------------------- DELETE (remove) ---------------------
router.delete("/:id", async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const studentRepo = AppDataSource.getRepository("Student");

    const student = await studentRepo.findOne({
      where: { id: studentId },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    await studentRepo.remove(student);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
