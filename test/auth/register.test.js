const request = require("supertest");
const app = require("../../app");
const database = require("../database");

describe("Test register", () => {
  beforeAll(() => {
    database.connect();
  });

  afterAll((done) => {
    database.disconnect(done);
  });

  test("Register user", () => {
    const user = {
      username: "test" + Math.random().toString().slice(2, 7),
      email: "test@email.com",
      password: "123@231131323",
    };
    return request(app)
      .post("/auth/register")
      .send(user)
      .then((res) => {
        expect(res.statusCode).toBe(201);
        expect(res.body.username).toBe(user.username);
        expect(res.body.email).toBe(user.email);
      });
  });

  test("Recieve 400 when one of username, email, password is empty.", () => {
    const user = {
      username: "",
      email: "",
      password: "123@231131323",
    };

    return request(app)
      .post("/auth/register")
      .send(user)
      .then((res) => {
        expect(res.statusCode).toBe(400);
      });
  });

  test("Recieve 400 when password'length is less than 12 characters.", () => {
    const user = {
      username: "",
      email: "",
      password: "",
    };

    return request(app)
      .post("/auth/register")
      .send(user)
      .then((res) => {
        expect(res.statusCode).toBe(400);
      });
  });

  test("Recieve 400 when username has existed.", async () => {
    // register a user
    const user = {
      username: "test" + Math.random().toString().slice(2, 7),
      email: "test@email.com",
      password: "123@231131323",
    };
    await request(app).post("/auth/register").send(user);

    const res = await request(app).post("/auth/register").send(user);
    expect(res.statusCode).toBe(400);
  });
});
