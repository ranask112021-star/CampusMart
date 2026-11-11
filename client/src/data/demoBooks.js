const demoBooks = [
  { title: "Books", file: "Books.jpg", price: 250 },
  { title: "C Programming", file: "C.jpg", price: 300 },
  { title: "Communication Skills 2", file: "Communication Skills 2.jpg", price: 250 },
  { title: "Communication Skills", file: "Communication Skills.jpg", price: 250 },
  { title: "DBMS Management", file: "DBMS Management.jpg", price: 350 },
  { title: "DBMS", file: "DBMS.jpg", price: 300 },
  { title: "Java Pro", file: "JAVA Pro.jpg", price: 400 },
  { title: "Java Programming", file: "JAVA Programming.jpg", price: 350 },
  { title: "JavaScript", file: "JavaScript.jpg", price: 300 },
  { title: "MERN Stack for Beginners", file: "Mern Stack Bignning.jpg.webp", price: 450 },
  { title: "MERN Stack", file: "MERN STACK.jpg", price: 400 },
  { title: "MERN Stack", file: "mern stack.jpg.webp", price: 400 },
  { title: "Pro MERN Stack", file: "Pro MERN Stack.jpg", price: 450 },
  { title: "Python Programming", file: "Python Programming.jpg", price: 350 },
  { title: "Python", file: "PYTHON.jpg", price: 300 },
].map((book, index) => ({
  ...book,
  _id: `demo-book-${index + 1}`,
  category: "Books",
  condition: "Good",
  location: "Campus",
  isDemo: true,
  images: [{ url: `/books/${encodeURIComponent(book.file)}` }],
}));

export default demoBooks;
