process.env.NODE_ENV = "test";
const request = require("supertest");

const app = require("../app");
const db = require("../db");

beforeEach(async () => {
  await db.query(`INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
    VALUES (  90691161518,
  "http://a.co/eobPtX2",
  "Matthew Lane",
  "english",
  264,
  "Princeton University Press",
 "Power-Up: Unlocking the Hidden Mathematics in Video Games",
  2017)
  (9780140430721,
  "http://google.com",
  "Jane Austen",
  "english",
  254,
  "Whitehall",
  "Pride and Prejudice",
  1813)
  RETURNING isbn`);
});

describe("GET /books", () => {
  test("Get all books", async () => {
    const res = await request(app).get("/books");
    expect(res.body).toEqual({
      books: [
        {
          isbn: "0691161518",
          amazon_url: "http://a.co/eobPtX2",
          author: "Matthew Lane",
          language: "english",
          pages: 264,
          publisher: "Princeton University Press",
          title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
          year: 2017,
        },
        {
          isbn: "9780140430721",
          amazon_url: "http://google.com",
          author: "Jane Austen",
          language: "english",
          pages: 254,
          publisher: "Whitehall",
          title: "Pride and Prejudice",
          year: 1813,
        },
      ],
    });
  });
});

describe("GET /books/:isbn", () => {
  test("Get info on book", async () => {
    const res = await request(app).get("/books/9780140430721");
    expect(res.body).toEqual({
      book: {
        isbn: "9780140430721",
        amazon_url: "http://google.com",
        author: "Jane Austen",
        language: "english",
        pages: 254,
        publisher: "Whitehall",
        title: "Pride and Prejudice",
        year: 1813,
      },
    });
  });
  test("Get 400 if book not found", async () => {
    const res = await request(app).get("/book/1234567");
    expect(res.status).toBe(400);
  });
});

describe("POST /books", () => {
  test("Add book", async () => {
    const res = await request(app).post("/books").send({
      isbn: "9781593081171",
      amazon_url: "http://google.com",
      author: "Charlotte Bronte",
      language: "english",
      pages: 592,
      publisher: "Harper and Brothers",
      title: "Jane Eyre",
      year: 1847,
    });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      book: {
        isbn: 9781593081171,
        amazon_url: "http://google.com",
        author: "Charlotte Bronte",
        language: "english",
        pages: 592,
        publisher: "Harper and Brothers",
        title: "Jane Eyre",
        year: 1847,
      },
    });
  });
  test("Return 400 for issue", async () => {
    const res = await request(app).post("/books").send({
      isbn: 9781593081171,
      amazon_url: "http://google.com",
      author: "Charlotte",
      language: "english",
      pages: 592,
      title: "Jane Eyre",
      year: 1847,
    });
    expect(res.status).toEqual(400);
  });
});

describe("PUT /books/:id", () => {
  test("Update book", async () => {
    const res = await request(app)
      .put("/book/0691161518")
      .send({ language: "french" });
    expect(res.body).toEqual({
      book: {
        isbn: 90691161518,
        amazon_url: "http://a.co/eobPtX2",
        author: "Matthew Lane",
        language: "french",
        pages: 264,
        publisher: "Princeton University Press",
        title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
        year: 2017,
      },
    });
  });
});

describe("DELETE /", () => {
  test("Delete book", async () => {
    const res = await request(app).delete("/book/9780140430721");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Book deleted" });
  });
});

afterEach(async () => {
  await db.query("DELETE FROM BOOKS");
});

afterAll(async () => {
  await db.end();
});
