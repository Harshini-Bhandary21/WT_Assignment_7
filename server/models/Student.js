// Mongoose schema: describes the shape of a student document and the rules for each field.
const mongoose = require("mongoose");

const BRANCHES = ["Computer", "IT", "Mechanical", "Civil", "Electronics"];

const studentSchema = new mongoose.Schema(
  {
    rollNo: {
      type: String, required: [true, "rollNo is required."], unique: true, trim: true, uppercase: true,
      match: [/^[A-Z0-9-]{4,15}$/, "rollNo must be 4 to 15 letters, digits or dashes."],
    },
    name: {
      type: String, required: [true, "name is required."], trim: true,
      minlength: [3, "name must be at least 3 characters."], maxlength: [50, "name can have at most 50 characters."],
      match: [/^[A-Za-z .]+$/, "name can contain only letters, spaces and dots."],
    },
    email: {
      type: String, required: [true, "email is required."], trim: true, lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "email is not in a valid format."],
    },
    phone: {
      type: String, required: [true, "phone is required."], trim: true,
      match: [/^[6-9]\d{9}$/, "phone must be 10 digits and start with 6, 7, 8 or 9."],
    },
    branch: { type: String, required: [true, "branch is required."], enum: { values: BRANCHES, message: `branch must be one of: ${BRANCHES.join(", ")}.` } },
    year: { type: Number, required: [true, "year is required."], min: [1, "year must be from 1 to 4."], max: [4, "year must be from 1 to 4."], validate: { validator: Number.isInteger, message: "year must be a whole number." } },
    cgpa: { type: Number, required: [true, "cgpa is required."], min: [0, "cgpa must be from 0 to 10."], max: [10, "cgpa must be from 0 to 10."] },
  },
  { timestamps: true }          // adds createdAt and updatedAt automatically
);

// Indexes make the filter and sort queries faster.
studentSchema.index({ branch: 1, year: 1 });
studentSchema.index({ cgpa: -1 });

module.exports = { Student: mongoose.model("Student", studentSchema), BRANCHES };
