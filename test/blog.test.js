const request = require("supertest");
const app = require("../app");
const database = require("./database");

describe("Test blog path", () => {
  beforeEach(() => {
    database.connect();
  });

  afterEach((done) => {
    database.disconnect(done);
  });

  test("Get all blogs", (done) => {
    request(app)
      .get("/blogs")
      .then((res) => {
        console.log(res.body);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        done();
      });
  });
});
