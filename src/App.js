import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [query, setQuery] = useState('');
  const [bookData, setBookData] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [loginForm, setLoginForm] = useState(true);
  const [cart, setCart] = useState([]);
  const [userCredentials, setUserCredentials] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (query && !userModalOpen) {
      searchBooks();
    }
  }, [query, userModalOpen]);

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
    setLoginForm(true); // Establecer el formulario de inicio de sesión como activo por defecto
    setBookData(null); // Limpiar la información del libro
    setRelatedBooks([]); // Limpiar los libros relacionados
    setQuery(''); // Limpiar el texto de búsqueda
  };

  const handleCloseUserModal = () => {
    setUserModalOpen(false);
  };

  const handleUserInputChange = (event) => {
    const { name, value } = event.target;
    setUserCredentials({ ...userCredentials, [name]: value });
  };

  const handleSubmitUserCredentials = (event) => {
    event.preventDefault();
    // Aquí puedes manejar la lógica para enviar los datos del usuario a tu backend o hacer lo que necesites con ellos
    console.log(userCredentials);
  };

  const handleToggleForm = () => {
    setLoginForm(!loginForm);
  };

  const handleAddToCart = () => {
    const existingBookIndex = cart.findIndex(item => item.title === bookData.volumeInfo.title);
    if (existingBookIndex !== -1) {
      // Si el libro ya está en el carrito, aumentamos su cantidad
      const updatedCart = [...cart];
      updatedCart[existingBookIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      // Si el libro no está en el carrito, lo agregamos con una cantidad inicial de 1
      const newBook = { 
        title: bookData.volumeInfo.title, 
        price: 25, // Costo base de $25 por libro
        thumbnail: bookData.volumeInfo.imageLinks.thumbnail,
        quantity: 1
      };
      setCart([...cart, newBook]);
    }
  };

  const handleOpenCartModal = () => {
    setUserModalOpen(true);
    setLoginForm(false); // No mostramos ningún formulario en la ventana modal
    setBookData(null); // Limpiar la información del libro
    setRelatedBooks([]); // Limpiar los libros relacionados
    setQuery(''); // Limpiar el texto de búsqueda
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleRemoveFromCart = (index) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
  };

  const getTotalCost = () => {
    return cart.reduce((total, book) => total + (book.price * book.quantity), 0);
  };

  return (
    <div className="App" style={{ backgroundColor: '#23395B', color: '#FFF', textAlign: 'center', padding: '20px' }}>
      <header className="App-header">
        <h1>RABE Librería</h1>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          {!userModalOpen && <button onClick={handleOpenUserModal}>Usuario</button>}
          <button onClick={handleOpenCartModal}>Carrito</button>
          <button onClick={() => alert("Configuraciones")}>Configuraciones</button>
        </div>
        <div>
          {!userModalOpen && (
            <>
              <input type="text" placeholder="Buscar libro..." value={query} onChange={handleInputChange} />
              <button onClick={handleSearch}>Buscar</button>
            </>
          )}
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
            <h2>{loginForm ? 'Inicio de Sesión' : 'Registro'}</h2>
            {loginForm ? (
              <form onSubmit={handleSubmitUserCredentials} style={{ display: 'flex', flexDirection: 'column' }}>
                <label>
                  Correo:
                  <input type="email" name="email" value={userCredentials.email} onChange={handleUserInputChange} />
                </label>
                <label>
                  Contraseña:
                  <input type="password" name="password" value={userCredentials.password} onChange={handleUserInputChange} />
                </label>
                <button type="submit">Iniciar Sesión</button>
                <button type="button" onClick={handleToggleForm}>Registrarse</button>
              </form>
            ) : (
              <form onSubmit={handleSubmitUserCredentials} style={{ display: 'flex', flexDirection: 'column' }}>
                <label>
                  Nombre:
                  <input type="text" name="name" value={userCredentials.name} onChange={handleUserInputChange} />
                </label>
                <label>
                  Dirección:
                  <input type="text" name="address" value={userCredentials.address} onChange={handleUserInputChange} />
                </label>
                <label>
                  Teléfono:
                  <input type="text" name="phone" value={userCredentials.phone} onChange={handleUserInputChange} />
                </label>
                <label>
                  Correo:
                  <input type="email" name="email" value={userCredentials.email} onChange={handleUserInputChange} />
                </label>
                <label>
                  Contraseña:
                  <input type="password" name="password" value={userCredentials.password} onChange={handleUserInputChange} />
                </label>
                <button type="submit">Registrarse</button>
                <button type="button" onClick={handleToggleForm}>Iniciar Sesión</button>
              </form>
            )}
          </div>
        </div>
      )}
      {userModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={handleCloseUserModal}>&times;</span>
            <h2>Carrito</h2>
            <div>
              {cart.length === 0 ? (
                <p>No hay libros en el carrito.</p>
              ) : (
                <>
                  <ul>
                    {cart.map((item, index) => (
                      <li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ marginRight: '10px' }}>
                          <img src={item.thumbnail} alt="Portada del libro" style={{ width: '50px', height: '70px' }} />
                        </div>
                        <div>
                          <p>{item.title} - ${item.price} x {item.quantity}</p>
                          <div>
                            <button onClick={() => {
                              const updatedCart = [...cart];
                              updatedCart[index].quantity += 1;
                              setCart(updatedCart);
                            }}>+</button>
                            <button onClick={() => {
                              const updatedCart = [...cart];
                              if (updatedCart[index].quantity > 1) {
                                updatedCart[index].quantity -= 1;
                                setCart(updatedCart);
                              }
                            }}>-</button>
                            <button onClick={() => handleRemoveFromCart(index)}>Eliminar</button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <p>Total: ${getTotalCost()}</p>
                </>
              )}
              <button onClick={handleClearCart}>Limpiar Carrito</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
