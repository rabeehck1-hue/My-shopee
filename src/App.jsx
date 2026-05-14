import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import './App.css'; 

function App() {

  const [isLogin,setIsLogin] = useState(false)

  const [user,setUser] = useState(() => {
    const savedUser = 
    localStorage.getItem("user")
    return savedUser? JSON.parse(savedUser) : null
  })
  const [userName,setUserName] = useState("")
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [orders,setOrders] = useState([])
  const [image,setImage] = useState("")
  const [sortOrder,setSortOrder] = useState("")
  const [search,setSearch] = useState("")
  const [editId,setEditId] = useState(null)
  const [name,setName] = useState("")
  const [price,setPrice] = useState("")
  const [category,setCategory] = useState("")
  const [showCategory,setShowCategory] = useState(false)
  const [showSort,setShowSort] = useState(false)
  const [filterCategory, setFilterCategory] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [selectedProduct,setSelectedProduct] = useState(null)
  const [darkMode,setDarkMode] = useState(false)
  const [wishlist,setWishlist] = useState (() => {
    const savedWishlist = localStorage.getItem("wishlist")
    return savedWishlist ? JSON.parse(savedWishlist) : []
  })

   useEffect(() => {
    localStorage.setItem("wishlist",JSON.stringify(wishlist))
  },[wishlist])

  const handleAuth = async (e) => {
    e.preventDefault()

     if(!password || !email || (!isLogin && !userName)){
          toast.error("Please fill all the fields") 
          return
        }

        if (password.length <8) {
          toast.error("Password must be at least 8 characters")
          return
        }


    const url = isLogin
    ? "https://my-shopee-backend.onrender.com/login"
    : "https://my-shopee-backend.onrender.com/signup"

    const bodyData = isLogin
    ? {email,password}
    : {name:userName,email,password}

    try{
      const res = await fetch(url,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData)
      })
      const data = await res.json()

      if(data.error){
        toast.error(data.error)
      }else {
        toast.success(isLogin ? "Login success" : "Signup success")

        setTimeout(() => {
           if(isLogin){
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        setUser(data.user)
        }
        },2000)
      }

      setUserName("")
      setEmail("")
      setPassword("")
      
    }catch (err){
      console.log("AUTH ERROR:", err)
    }
  }

   const handleSubmit = async (e) => {
    e.preventDefault()
    
   try {
    if(editId){
       const token = localStorage.getItem("token")


     const res = await
    fetch(`https://my-shopee-backend.onrender.com/products/${editId}`,{
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name,
      price: Number(price),
      category,
      image
    })
  })
  const data = await res.json();

  if(!res.ok){
    toast.error(data.error)
    return
  }

  setProducts((prev) => prev.map((item) =>item._id === editId ?data :item))
  
  setEditId(null)
   setName("")
  setPrice("")
  setCategory("")
  setImage("")

  if (res.status === 401) {
    logoutUser()
    return
  }
  }

  else{

    const token = localStorage.getItem("token")

     const res = await
    fetch("https://my-shopee-backend.onrender.com/products",{
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name,
      price: Number(price),
      category,
      image
    })
  })
  const data = await res.json();

  if(!res.ok){
    toast.error(data.error)
    return
  }

  setProducts((prev) => [...prev, data])

  setName("")
  setPrice("")
  setImage("")

   if (res.status === 401) {
    logoutUser()
    return
  }
  }
  }catch (err){
    console.log("POST ERROR:",err)
}
}

    const logoutUser = () => {
      setUser(null)
      setOrders([])
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      toast.error("Session expired please login again")
    }
    
useEffect(() => {
  const loadOrders = async () => {
    if (!user) {
      setOrders([]);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("https://my-shopee-backend.onrender.com/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("ORDER FETCH ERROR:", data.error);
        setOrders([]);
        return;
      }

      setOrders(Array.isArray(data) ? data : []);

       if (res.status === 401) {
    logoutUser()
    return
  }
    } catch (err) {
      console.log("ORDER FETCH ERROR:", err);
      setOrders([]);
    }
  };

  loadOrders();
}, [user]);


  const [products,setProducts] = useState([])
  const [loading,setLoading] = useState(true)
 useEffect(() => {
  fetch("https://my-shopee-backend.onrender.com/products")
    .then((res) => res.json())
    .then((data) => {
      console.log("PRODUCT DATA:", data);

      setProducts(Array.isArray(data) ? data : []);

      setLoading(false);
    })
    .catch((err) => {
      console.log("ERROR:", err);

      setProducts([]);

      setLoading(false);
    });
}, []);

  const deleteProduct = async (_id) => {
      const confirmDelete = window.confirm("are you sure you want to delete this product")

      if(!confirmDelete) return

    try{
      const token = localStorage.getItem("token")

      const res = await
      fetch(`https://my-shopee-backend.onrender.com/products/${_id}`,{
        method: "DELETE",
        headers: {
      Authorization: `Bearer ${token}`,},
    })

    const data = await res.json()

    if(!res.ok){
    toast.error(data.error)
    return
  }

      setProducts((prev) => prev.filter((item) => item._id !== _id))
      toast.success("Product deleted")
       if (res.status === 401) {
    logoutUser()
    return
  }
    }catch(err) {
      toast.error("Delete failed",err)
    }
  }
  

  const [cart,setCart] = useState(()=>{
    const savedCart = localStorage.getItem("cart")
    return savedCart ? JSON.parse(savedCart) : []
  })
  const addToCart = (products) => {
    const exist =cart.find((item) =>item._id === products._id)
    if(exist){
      const updatedCart = cart.map((item) =>
      item._id === products._id
      ?{...item,Qty: item.Qty + 1}
      : item
    )
    setCart(updatedCart)
    }
    else{
     setCart([...cart,{...products,Qty: 1}])
    }
  }
  const removeFromCart=(index) => {
    const newCart = cart.filter((item,i) => i !== index)
    setCart(newCart)
  }
  const total=cart.reduce((sum,item) => sum + item.price * item.Qty,0)
  const increaseQty = (_id) => {
      const updateQty = cart.map((item)=>
    item._id === _id
    ?{...item,Qty: item.Qty + 1}
     : item
    )
    setCart(updateQty)
  }
  const decreaseQty = (_id) => {
      const updateQty = cart.map((item)=>
    item._id === _id
    ?{...item,Qty: item.Qty - 1}
     : item
    ).filter((item)=>item.Qty > 0)
    setCart(updateQty)
  }

  useEffect(()=>{
    localStorage.setItem("cart",JSON.stringify(cart))
  },[cart])
   if(loading){
    return(
      <div className='loader-container'>
        <div className='loader'></div>
      </div>
    )
  }

     

  const handleEdite = (item) => {
    setName(item.name)
    setPrice(item.price)
    setCategory(item.category)
    setEditId(item._id)
    setImage(item.image)
  }

  const filteredProducts = products.filter((item) => {

    if (!item.name) return false

  const matchesSearch = item.name.
  toLowerCase()
  .includes(search.toLowerCase())

 const matchesCategory =
  filterCategory === "" || item.category === filterCategory;

  return matchesCategory && matchesSearch
})

  const  displayProducts = [...filteredProducts];
    if(sortOrder === "Low"){
     displayProducts.sort((a,b) => {
     return a.price - b.price
     })
    }
    else if(sortOrder === "High"){
     displayProducts.sort((a,b) => {
     return b.price - a.price
     })
    }
    

    const uniqueCategory = 
      [...new Set(products.map((item) => item.category))]

      const placeOrder = async () => {
        if(cart.length === 0){
          toast.error("Cart is empty")
          return
        }

        const confirmOrder = window.confirm("Place this order?")

        if(!confirmOrder) return

        try{

          const token = localStorage.getItem("token")
          
           const res = await
    fetch("https://my-shopee-backend.onrender.com/orders",{
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: cart,
      total: total,
    })
        })

        const data = await res.json()
        console.log("ORDER SAVED", data)

        setOrders((prev) => [...prev, data]);
        setCart([])
        toast.success("Order places successfully")
         if (res.status === 401) {
    logoutUser()
    return
  }
      } catch (err) {
        console.log("ORDER ERROR", err)
      }
    }

    const toggleWishlist = (product) => {
      const exists = wishlist.find((item) => item._id === product._id)
      if (exists) {
        setWishlist((prew) => prew.filter((item) => item._id !== product._id))
        toast.info("Removed from wishlist")
      }
      else{
        setWishlist((prew) => [...prew,product])
        toast.success("Added to wishlist")
      }
    }

    if(!user){
      return(
        <div className='auth-container'>
          <div className='auth-card'>

      <h2>{isLogin ? "Login" : "Signup"}</h2>

      <form onSubmit={handleAuth}>
      {!isLogin && (
        <input
        type='text'
        placeholder='Name'
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        />
      )}

      <input
      type='email'
      placeholder='Email'
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      />

      <div className='password-field'>

      <input
      type={showPassword ? 'text' : 'password'}
      placeholder='Password'
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      />

      <span className='eye-icon'
      onClick={() =>setShowPassword(!showPassword)}>
        {showPassword ? <EyeOff size={18} /> : <Eye size={18}/>}
      </span>


      </div>

      <button type='submit'>{isLogin ? "Login" : "Signup"}</button>

      </form>

      <p onClick={() => setIsLogin(!isLogin)}
        className='switch-text'>
        {isLogin ? "Create Account" : "Already have an account?"}
      </p>

      </div>
      <ToastContainer position='top-right' autoClose={2000} />
    </div>

      )
    }


  return (
    <div className={darkMode?"App dark" : "App"}>
      <div className='navbar'>
        <h2>My Shopee</h2>

          <div className='search-box'>
      <input 
      type='text'
      placeholder='Search Products'
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      />

      <div className='custom-dropdown'>

      <button onClick={() =>setShowCategory(!showCategory)}>
        {filterCategory || "All Category"} {showCategory? "▲" : "▼"}
      </button>

      {showCategory &&(
        <div className='dropdown-menu'>
          <p onClick={() => {
            setFilterCategory("")
            setShowCategory(false)
          }}>None
          </p>

          {uniqueCategory.map((cat,index) => (
            <p
            key={index}
            onClick={() => {
              setFilterCategory(cat)
              setShowCategory(false)
            }}
            >
              {cat}
            </p>
          ))}
        </div>
      )}
      </div>

      <div className='custom-dropdown'>

      <button onClick={() =>setShowSort(!showSort)}>
        {sortOrder || "Sort Product"} {showSort? "▲" : "▼"}
      </button>

      {showSort &&(
        <div className='dropdown-menu'>
          <p onClick={() => {
            setSortOrder("")
            setShowSort(false)
          }}>
            None
          </p>

            <p
            onClick={() => {
              setSortOrder("Low")
              setShowSort(false)
            }}
            >
              Low to High
            </p>

            <p
            onClick={() => {
              setSortOrder("High")
              setShowSort(false)
            }}
            >
              High to Low
            </p>
        </div>
      )}
      </div>

      </div>

        <div>
          <span>Hi, {user.name}</span>
          <span className='role'>{user.role}</span>
          <button onClick={() => {
            setTimeout(() => {
              toast.info("Logged Out")
            },800)
            setUser(null)
            localStorage.removeItem("user")
            localStorage.removeItem("token")
            setOrders([])
          }}>Logout</button>

          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>

        </div>

      </div>

        {user?.role === "admin" && (
          
          <div className='add-product-card'>
            <h4 className='title'>Add Products</h4>
        <form onSubmit={handleSubmit} className='product-form'>
          <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value )}/>

          <input
          type="number"
          placeholder="Product price"
          value={price}
          onChange={(e) => setPrice(e.target.value )}/>

          <input
          type="text"
          placeholder="Product category"
          value={category}
          onChange={(e) => setCategory(e.target.value )}/>

          <input
          type="text"
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value )}/>

          <button type="submit" className='add-product-btn' onClick={() => {toast.success("Product Added")}}>{ editId ? "Update" : "Add"}</button>

        </form>
        </div>
)}

    <h4 className='title'>Product List</h4>

    {displayProducts.length === 0 ? (
      <p className='empty-text'>No products founnd</p>
    ) : (

    <div className='product-container'>
  {displayProducts.map((item) => (
      <div className='product-card' key={item._id}>
        {item.image && <img src={item.image} alt={item.name} width="150"/>}
        <h3>{item.name}</h3>
        <p>₹{item.price.toLocaleString("en-IN")}</p>

          <div className='card-btn'>
        <button onClick={() => addToCart(item)}>Add Cart</button>
        <button onClick={() => setSelectedProduct(item)}>View</button>
        <button onClick={() => toggleWishlist(item)}>
          {wishlist.find((p) => p._id === item._id) ? "❤️" : "🤍"}
        </button>
        </div>

         {user?.role === "admin" && (
          <div className='admin-btn'>
        <button onClick={() => handleEdite(item)}>Edit</button>
        <button onClick={() => deleteProduct(item._id)}>Delete</button>
        </div>
        )}
      </div>
    ))}
    </div>
)}

    <div className='cart-container'>
      <h4 className='title'>Cart List</h4> 
    {cart.length === 0 ? (<p className='empty-text'>Your cart is empty</p>) : (
      cart.map((item,index) => (

      <div className='cart-item' key={index}>
        
       {item.image && <img src={item.image} alt={item.name} width="150"/>}
       
      <h4 className='cart-name'>{item.name}</h4>

      <div className='qty-box'>

      <button onClick={()=>increaseQty(item._id)}>+</button>
      <span>{item.Qty}</span>
      <button onClick={()=>decreaseQty(item._id)}>-</button><br></br>

      </div>

      <div className='cart-remove-btn'>
      <button onClick={() => removeFromCart(index)}>Remove</button>
      </div>


      </div>
    )))}
    </div>

    <div className='order-btn'>
    <h4>Total: ₹{total.toLocaleString("en-IN")}</h4>
    <button onClick={placeOrder}>Place Order</button>
    </div>

    <h4 className='title'>Wishlist</h4>
    {wishlist.length === 0 ?(
      <p>No wishlist added</p>
    ) : (
      <div className='product-container'>
        {wishlist.map((item) => (
          <div className='product-card' key={item._id}>
            <img src={item.image} alt={item.name}/>
            <h3>{item.name}</h3>
            <p>₹ {item.price.toLocaleString("en-IN")}</p>
          </div>
        ))}
      </div>
    )}

    <h4 className='title'>Order History</h4>


{orders.length === 0 ? (
  <p className='empty-text'>No order yet</p>
) : (
  <div className='orders-container'>
{Array.isArray(orders) &&
  orders.map((order) => (
    <div className='order-card' key={order._id}>
      <div className='order-header'>
      <h4>Total: ₹{order.total.toLocaleString("en-IN")}</h4>

      <small>Date: {new Date(order.createdAt).toLocaleDateString()}</small>
      </div>

      {(order.items || []).map((item, index) => (
        <div className='order-item' key={index}>
          <span>{item.name}</span>
          <span>Qty: {item.Qty}</span>
        </div>
      ))}
    </div>
  ))}
    </div>
  )}
  {selectedProduct && (
    <div className='modal-overlay'>
    <div className='modal-card'>

      <button onClick={() => {setSelectedProduct(null)}}>X</button>

      {selectedProduct.image && (
        <img src={selectedProduct.image} alt={selectedProduct.name}/>
      )}

      <h2>{selectedProduct.name}</h2>

      <p>₹ {selectedProduct.price.toLocaleString('en-In')}</p>

      <p>Category: {selectedProduct.category}</p>

      <button onClick={() => addToCart(selectedProduct)}>Add cart</button>

    </div>
    </div>)}
   <ToastContainer position='top-right' autoClose={2000} />
  </div>
  )}
export default App;