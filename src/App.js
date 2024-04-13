import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [query, setQuery] = useState('');
  const [bookData, setBookData] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (query) {
      searchBooks();
    }
  }, [query]);

  const searchBooks = async () => {
    try {
      const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
      const book = response.data.items[0]; // Tomamos el primer libro de la respuesta
      setBookData(book);
      if (book && book.volumeInfo && book.volumeInfo.categories && book.volumeInfo.categories.length > 0) {
        const category = book.volumeInfo.categories[0];
        const relatedResponse = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=subject:${category}&maxResults=3`);
        setRelatedBooks(relatedResponse.data.items);
      } else {
        setRelatedBooks([]);
      }
    } catch (error) {
      console.error('Error fetching book data:', error);
    }
  };

  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSearch = () => {
    searchBooks();
  };

  const handleRelatedBookClick = async (title) => {
    setQuery(title); // Establecer el título del libro relacionado como consulta
  };

  const handleOpenUserModal = () => {
    setUserModalOpen(true);
    setBookData(null); // Limpiar la información del libro
    setRelatedBooks([]); // Limpiar los libros relacionados
    setQuery(''); // Limpiar el texto de búsqueda
  };

  const handleCloseUserModal = () => {
    setUserModalOpen(false);
  };

  const handleAddToCart = () => {
    const newBook = { title: bookData.volumeInfo.title, price: 10 }; // Asumiendo un precio de $10 por libro
    setCart([...cart, newBook]);
  };

  return (
    <div className="App" style={{ backgroundColor: '#23395B', color: '#FFF', textAlign: 'center', padding: '20px' }}>
      <header className="App-header">
        <h1>RABE Librería</h1>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button onClick={handleOpenUserModal}>Usuario</button>
          <button onClick={() => alert("Carrito de compras")}>Carrito</button>
          <button onClick={() => alert("Configuraciones")}>Configuraciones</button>
        </div>
        <div>
          <input type="text" placeholder="Buscar libro..." value={query} onChange={handleInputChange} />
          <button onClick={handleSearch}>Buscar</button>
        </div>
        {bookData && (
          <div className="book-info">
            <h2>{bookData.volumeInfo.title}</h2>
            <p>{bookData.volumeInfo.authors && bookData.volumeInfo.authors.join(', ')}</p>
            {bookData.volumeInfo.imageLinks && (
              <img src={bookData.volumeInfo.imageLinks.thumbnail} alt="Portada del libro" style={{ width: '150px', height: '200px', margin: '0 auto', display: 'block' }} />
            )}
            <p>{bookData.volumeInfo.description}</p>
            <button onClick={handleAddToCart} style={{ marginTop: '10px' }}>Agregar al carrito</button>
          </div>
        )}
        {relatedBooks.length > 0 && (
          <div className="related-books">
            <h2 style={{ marginTop: '20px' }}>Libros relacionados</h2>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {relatedBooks.map((book, index) => (
                <div key={index} onClick={() => handleRelatedBookClick(book.volumeInfo.title)} style={{ margin: '0 10px', cursor: 'pointer' }}>
                  <p>{book.volumeInfo.title}</p>
                  <p>{book.volumeInfo.authors && book.volumeInfo.authors.join(', ')}</p>
                  {book.volumeInfo.imageLinks && (
                    <img src={book.volumeInfo.imageLinks.thumbnail} alt="Portada del libro" style={{ width: '50px', height: '70px', margin: '0 auto', display: 'block' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </header>
      {userModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={handleCloseUserModal}>&times;</span>
            <h2>Usuario</h2>
            {/* Aquí puedes colocar el formulario de inicio de sesión o registro */}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
