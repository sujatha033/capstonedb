import express from "express";
import ejs from "ejs";
import axios from "axios";
import bodyParser from "body-parser";
import pg from "pg";


const port = 3000;
const app = express();

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "mybooks",
  password: "suji033",
  port: "5432",
});

db.connect();

let books = [];
  
 // middleware
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

// home page
app.get("/", async(req, res) => {
  try{
  const result = await db.query("select * from books order by id asc");
  const books = result.rows;
  res.render("index.ejs", {
    books: books,
  });
}catch(err){
  console.log(err);
}
});

//to check book is available or not
app.get("/get-book", async (req, res) => {
  const title = req.query.title;

  try {
    const result = await axios.get("https://openlibrary.org/search.json", {
      params: {
        title: title,
        limit: 1,
      },
    });
  
    const book = result.data.docs[0];
    res.render("modify.ejs", { book : book });
  } catch (error) {
    console.error(error);
  res.status(500).send("Error fetching book data");
  }
});


// add book to database

app.post('/add-book', (req, res) => {
  const { title, author, date, content, rating } = req.body;
  const coverImage = req.body.cover_i;
  console.log(coverImage);
  // Validate rating
  if (rating < 1 || rating > 10) {
    return res.status(400).send('Invalid rating');
  }

  // Add book to database
  db.query(`INSERT INTO books (title, author, date, content, rating, cover_image) VALUES ($1, $2, $3, $4, $5, $6)`, [title, author, date, content, rating, coverImage])
    .then(() => {
      res.redirect('/');
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error adding book');
    });
});

// app.post("/add-book", async(req, res) => {
//   const title = req.body.title;
//   console.log(title);
//   const content = req.body.content;

//   const author = req.body.author;
//   console.log(author);
//   const rating= req.body.rating;
//  
// res.render("modify.ejs");
// });

//  send data of which book edit to edit page .


//sort by rating
app.get("/title" , async(req,res) => {
  try{
    const result = await db.query("select * from books order by title asc");
    const books = result.rows;
    res.render("index.ejs", {
      books: books,
    });
  }catch(error){
    console.log("error");
  }
})

//sortby title
app.get("/latest" , async(req,res) => {
  try{
    const result = await db.query("select * from books order by date asc");
    const books = result.rows;
    res.render("index.ejs", {
      books: books,
    });

  }catch(error){
    console.log("error");
  }
})

//sortby rating
app.get("/rating" , async(req,res) => {
  try{
      const result = await db.query("select * from books order by rating asc");
      const books = result.rows;
      res.render("index.ejs", {
        books: books,
      });
  }catch(error){
    console.log("error");
  }
})
app.get("/edit/:id", async (req, res) => {
  // console.log((req.params.id));
  try {
    const book = await db.query("select * from books where id = $1", [(req.params.id)]);
     console.log(book.rows);
    console.log(book.rows[0]); 
    res.render("modify.ejs", { books: book.rows[0] }); 
  } catch (err) {
    console.log(err);
    res.send("Book not found");
  }
});
//update the database of edited book

  app.post("/edit/:id", async (req, res) => {
    const title = req.body.title;
    const content = req.body.content;
    const author = req.body.author;
    const rating = req.body.rating;
    const id = req.params.id;
      try {
       const result = await db.query("UPDATE books SET title = ($1),content = ($2),author = ($3),rating = ($4) WHERE id = $5", [title,content,author,rating, id]);
        res.redirect("/");
        } catch (err) {
          console.log(err);
        }
});
//delete book
app.get("/delete/:id", async(req,res) =>{
  const id = req.params.id;
  try {
    await db.query("delete from books where id = $1",[id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
})
app.listen(port ,() => {
    console.log(`server running on http://localhost:${port}`);
})

//abot page

app.get("/about" , async(req,res) => {
  res.render("about.ejs");
})