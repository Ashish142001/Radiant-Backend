const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index"); // Import your Express app

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Auth Routes", () => {
  let userEmail = `test${Date.now()}@mail.com`;

  it("should register a new user", async () => {
    const res = await request(app).post("/auth/register").send({
      username: "testuser",
      email: userEmail,
      password: "password123",
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body.msg).toBe("User registered successfully");
  });

  it("should login the user", async () => {
    const res = await request(app).post("/auth/login").send({
      email: userEmail,
      password: "password123",
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.msg).toBe("Login successful");
  });

  it("should not login with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: userEmail,
      password: "wrongpassword",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.msg).toBe("Invalid credentials");
  });

  it("should return error for invalid email during password reset", async () => {
    const res = await request(app).post("/auth/forgot-password").send({
      email: "invalidemail@mail.com",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.msg).toBe("User with this email does not exist");
  });
});
