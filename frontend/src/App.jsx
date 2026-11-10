import { useState, useEffect } from "react";
import { API_BASE_URL } from "./config";
import heroImage from "./assets/first.png";
import productImage from "./assets/second.png";
import chapterImage from "./assets/third.png";
import ivoryTee from "./assets/ivory-tee.png";
import oliveOvershirt from "./assets/olive-overshirt.png";
import slateSweatshirt from "./assets/slate-sweatshirt.png";
import clayShirt from "./assets/clay-shirt.png";
import "./App.css";

function App() {
  const [series, setSeries] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [activeChapter, setActiveChapter] = useState(null);
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [chapterImageUrl, setChapterImageUrl] = useState("");
  const [productImageUrl, setProductImageUrl] = useState("");

  const cartTotal = cartItems.reduce(
    (total, item) => total + Number(item.price),
    0,
  );

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/series`)
      .then((response) => response.json())
      .then((data) => setSeries(data))
      .catch((error) => console.error("could not load series:", error));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/series/2/chapters`)
      .then((response) => response.json())
      .then((data) => setChapters(data))
      .catch((error) => console.error("could not load chapter:", error));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        return response.json();
      })
      .then((data) => {
        const item = data.find((item) => item.id === 1) || data[0];

        if (!item) {
          throw new Error("No products found");
        }

        setProduct(item);
      })
      .catch((error) => {
        console.error("Product loading error:", error);
      });
  }, []);

  useEffect(() => {
    if (activeChapter) {
      document
        .getElementById("chapter-detail")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeChapter]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/media/hero`)
      .then((response) => response.json())
      .then((data) => {
        if (data.url) {
          setHeroImageUrl(data.url);
        }
      })
      .catch((error) => {
        console.error("Hero image loading error:", error);
      });
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/media/chapter`)
      .then((res) => res.json())
      .then((data) => {
        if (data.url) setChapterImageUrl(data.url);
      })
      .catch((error) => console.error("Chapter image error:", error));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/media/product`)
      .then((res) => res.json())
      .then((data) => {
        if (data.url) setProductImageUrl(data.url);
      })
      .catch((error) => console.error("Product image error:", error));
  }, []);

  return (
    <main>
      <header className="site-header">
        <a href="#">"QUIET BATTLES"</a>

        <nav>
          <a href="#archive">THE ARCHIVE</a>
          <a href="#series">SERIES 01</a>
        </nav>

        <button
          className="cart-button"
          type="button"
          onClick={() => setShowCart(true)}
          aria-label={`Open cart, ${cartItems.length} items`}
          title="Open cart"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M2 2h2l2.68 12.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L22 7H5" />
            <circle cx="10" cy="20" r="1" />
            <circle cx="18" cy="20" r="1" />
          </svg>
          <span>{cartItems.length}</span>
        </button>
      </header>

      {showCart ? (
        <section id="cart" className="cart-page">
          <p>YOUR BAG / SERIES 01</p>
          <h1>Your Cart ({cartItems.length})</h1>

          {cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              {cartItems.map((item, index) => (
                <article className="cart-item" key={index}>
                  <img
                    className="cart-item-image"
                    src={item.image}
                    alt={item.title}
                  />
                  <div>
                    <h2>{item.title}</h2>
                    <p>Size: {item.size}</p>
                    <p>₹{item.price}</p>
                    <button
                      type="button"
                      className="remove-cart-item"
                      aria-label={`Remove ${item.title} from cart`}
                      onClick={() =>
                        setCartItems((items) =>
                          items.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="m19 6-1 14H6L5 6" />
                        <path d="M10 11v5M14 11v5" />
                      </svg>
                    </button>
                  </div>
                </article>
              ))}
              <p>Cart total: ₹{cartTotal}</p>
            </>
          )}

          <button type="button" onClick={() => setShowCart(false)}>
            Continue shopping
          </button>
        </section>
      ) : (
        <>
          <section className="hero">
            <img
              className="hero-image"
              src={heroImageUrl || heroImage}
              alt="QUIET BATTLES cinematic campaign"
            />
            <p>SERIES 01 - THE GENTLE ARMOR</p>
            <h1>
              WEAR YOUR <br />
              BATTLES.
            </h1>
            <a href="#series">EXPLORE THE COLLECTION ↓</a>
          </section>

          <section id="series" className="series-section">
            <p id="archive">THE ARCHIVE / SERIES 01</p>
            <h2>The Gentle Armor</h2>
            {series.map((item) => (
              <article key={item.id}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </section>

          <section className="series-section">
            <h2>Pieces in Color</h2>
            <div className="garment-grid">
              <article className="garment-card">
                <img src={ivoryTee} alt="Model wearing an ivory T-shirt" />
                <h3>Gentle Tee - Ivory</h3>
              </article>

              <article className="garment-card">
                <img
                  src={oliveOvershirt}
                  alt="Model wearing an olive overshirt"
                />
                <h3>Quiet Layer - Olive</h3>
              </article>

              <article className="garment-card">
                <img
                  src={slateSweatshirt}
                  alt="Model wearing a slate crewneck sweatshirt"
                />
                <h3>Everyday Crew - Slate</h3>
              </article>

              <article className="garment-card">
                <img src={clayShirt} alt="Model wearing a clay-colored shirt" />
                <h3>Soft Armor - Clay</h3>
              </article>
            </div>
          </section>

          <section className="series-section">
            <p>THE STORIES / SERIES 01</p>
            <h2>Five Chapters</h2>
            {chapters.map((item) => (
              <article key={item.id}>
                <h3>{item.title}</h3>
                <p>{item.story} </p>
                <button type="button" onClick={() => setActiveChapter(item)}>
                  READ THE CHAPTER
                </button>
              </article>
            ))}
          </section>

          {activeChapter && (
            <section id="chapter-detail" className="series-section">
              <p>CHAPTER / SERIES 01</p>
              <h2>{activeChapter.title}</h2>
              <p>{activeChapter.story}</p>
              <img
                className="chapter-image"
                src={chapterImageUrl || chapterImage}
                alt="A man in a black t-shirt looking out a window in morning light"
              />
              <button
                type="button"
                onClick={() => {
                  document.getElementById("product")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              >
                VIEW THE FEATURED OBJECT ↓
              </button>
            </section>
          )}

          <section id="product" className="series-section">
            {product ? (
              <>
                <div className="product-layout">
                  <div className="product-visual">
                    <img
                      className="product-image"
                      src={productImageUrl || productImage}
                      alt="The Gentle Armor Tee"
                    />
                  </div>

                  <div className="product-details">
                    <p>THE OBJECT / SERIES 01</p>

                    <h2>{product.title}</h2>

                    <p>{product.description}</p>

                    <h3>₹{product.price}</h3>

                    <label htmlFor="size">Choose a size</label>

                    <select
                      id="size"
                      value={selectedSize}
                      onChange={(event) => setSelectedSize(event.target.value)}
                    >
                      <option value="">Select a size</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                    </select>

                    <button
                      type="button"
                      disabled={!selectedSize}
                      onClick={() => {
                        setCartItems((items) => [
                          ...items,
                          {
                            title: product.title,
                            image: productImageUrl || productImage,
                            size: selectedSize,
                            price: product.price,
                          },
                        ]);

                        setCartMessage(
                          `${product.title} - size ${selectedSize} added to cart.`,
                        );
                      }}
                    >
                      ADD TO CART
                    </button>

                    <p aria-live="polite">{cartMessage}</p>

                    <button type="button" onClick={() => setShowCart(true)}>
                      VIEW CART
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p>Loading product...</p>
            )}
          </section>
        </>
      )}

      <footer className="site-footer">
        <p>© 2026 QUIET BATTLES™</p>

        <div className="footer-links">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
            <span>INSTAGRAM</span>
          </svg>

          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M13.5 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.6V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.2V13H10v8h3.5Z" />
            <span>FACEBOOK</span>
          </svg>

          <a href="/admin/login">ADMIN LOGIN</a>
        </div>
      </footer>
    </main>
  );
}

export default App;
