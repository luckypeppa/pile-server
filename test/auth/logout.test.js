const request = require("supertest");
const app = require("../../app");
const database = require("../database");

describe("Test logout", () => {
  beforeAll(() => {
    database.connect();
  });

  afterAll((done) => {
    database.disconnect(done);
  });

  test("logout user", async () => {
    // register a user
    const user = {
      username: "test" + Math.random().toString().slice(2, 7),
      email: "test@email.com",
      password: "123@231131323",
    };
    const result = await request(app).post("/auth/register").send(user);
    const refreshToken = result.body.refreshToken;

    const res = await request(app).delete("/auth/login").send({
      refreshToken,
    });
    expect(res.statusCode).toBe(200);
  });
});
