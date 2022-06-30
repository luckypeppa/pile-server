const request = require("supertest");
const app = require("../../app");
const database = require("../database");

describe("Test token", () => {
  beforeAll(() => {
    database.connect();
  });

  afterAll((done) => {
    database.disconnect(done);
  });

  test("get new access token", async () => {
    // register a user
    const user = {
      username: "test" + Math.random().toString().slice(2, 7),
      email: "test@email.com",
      password: "123@231131323",
    };
    const result = await request(app).post("/auth/register").send(user);
    const refreshToken = result.body.refreshToken;

    const res = await request(app).post("/auth/token").send({
      refreshToken,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  test("recieve 401 if refresh token is not valid", async () => {
    const refreshToken = "sdhfhsdfhshdfh";

    const res = await request(app).post("/auth/token").send({
      refreshToken,
    });
    expect(res.statusCode).toBe(401);
  });
});
