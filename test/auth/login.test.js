const request = require("supertest");
const app = require("../../app");
const database = require("../database");

describe("Test login", () => {
  beforeAll(() => {
    database.connect();
  });

  afterAll((done) => {
    database.disconnect(done);
  });

  test("login user", async () => {
    // register a user
    const user = {
      username: "test" + Math.random().toString().slice(2, 7),
      email: "test@email.com",
      password: "123@231131323",
    };
    await request(app).post("/auth/register").send(user);

    const res = await request(app).post("/auth/login").send({
      username: user.username,
      password: user.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe(user.username);
    expect(res.body.email).toBe(user.email);
  });

  test("Recieve 404 if user does not exist.", () => {
    const user = {
      username: "safsdfewfw",
      password: "123@231131323",
    };

    return request(app)
      .post("/auth/login")
      .send(user)
      .then((res) => {
        expect(res.statusCode).toBe(404);
      });
  });

  test("expect 400 if password is wrong", async () => {
    // register a user
    const user = {
      username: "test" + Math.random().toString().slice(2, 7),
      email: "test@email.com",
      password: "123@231131323",
    };
    await request(app).post("/auth/register").send(user);

    const res = await request(app).post("/auth/login").send({
      username: user.username,
      password: "21312",
    });
    expect(res.statusCode).toBe(400);
  });

});
